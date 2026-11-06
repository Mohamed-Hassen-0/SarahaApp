import { CLIENT_ID } from "../../../config/config.service.js";
import TokenModel from "../../DB/models/token.model.js";
import UserModel from "../../DB/models/User.model.js";
import * as dbServices from "../../DB/Repository/DB.Repository.js";
import { hashEnums } from "../../Utils/Enums/security.enums.js";
import { LogoutEnum, ProviderEnum } from "../../Utils/Enums/user.enum.js";
import { emailEvent } from "../../Utils/Events/event.email.js";
import { otpGenerator } from "../../Utils/otp/otp.js";
import {
  badRequest,
  conflictException,
  notFound,
  unauthorized,
} from "../../Utils/Response/error.response.js";
import successResponse from "../../Utils/Response/success.response.js";
import { decrypt, encrypt } from "../../Utils/Security/encryption.security.js";
import {
  compareHash,
  generateHash,
} from "../../Utils/Security/hash.security.js";
import { getNewLoginCredentials } from "../../Utils/token/token.js";

import { OAuth2Client } from "google-auth-library";

export const signup = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    dateOfBirth,
    phoneNumber,
    gender,
  } = req.body;

  const user = await dbServices.findOne(UserModel, { email });
  if (user) throw conflictException({ message: "User already exists" });

  const hashPassword = await generateHash({
    plainText: password,
    algorithm: hashEnums.BCRYPT,
  });
  const encryptedPhoneNumber = encrypt(phoneNumber);

  const genderUppercase = gender.toUpperCase();
  const newUser = await dbServices.create(UserModel, {
    firstName,
    lastName,
    email,
    password: hashPassword,
    dateOfBirth,
    phoneNumber: encryptedPhoneNumber,
    gender: genderUppercase,
  });
  const userObj = newUser.toObject();
  delete userObj.password;

  emailEvent.emit("Welcome", {
    to: email,
    firstName: `${firstName} ${lastName}`,
    lastName: userObj.lastName,
  });

  successResponse(res, 201, "User created successfully", userObj);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await dbServices.findOneAndUpdate(UserModel, { email }, {$set : {password: 1},$unset :{changeCridentialsTime: 1}});
  if (!user) throw unauthorized({ message: "Invalid credentials" });
  const isMatch = await compareHash({
    plainText: password,
    cliphertext: user.password,
    algorithm: hashEnums.BCRYPT,
  });
  if (!isMatch) throw unauthorized({ message: "Invalid credentials" });
  const userObj = user.toObject();
  delete userObj.password;
  if (userObj.phoneNumber) userObj.phoneNumber = decrypt(userObj.phoneNumber);
  const token = await getNewLoginCredentials(userObj);
  successResponse(res, 200, "User signed in successfully", { token });
};

export const refreshToken = async (req, res) => {
  const tokens = await getNewLoginCredentials(req.user);
  successResponse(res, 200, "Done", { tokens });
};

async function verifyGoogleAccount({ idToken }) {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();

  return payload;
}

export const loginWithGmail = async (req, res) => {
  const { idToken } = req.body;

  const { email, picture, given_name, family_name, email_verified } =
    await verifyGoogleAccount({ idToken });

  if (!email_verified) throw badRequest("Email Not Verified");

  const user = await dbServices.findOne(UserModel, { email });

  if (user) {
    if (user.provider === ProviderEnum.GOOGLE) {
      const tokens = await getNewLoginCredentials(user);
      successResponse(res, 200, "Done", { tokens });
    } else {
      throw badRequest("Please login using your original provider");
    }
  } else {
    const newuser = await dbServices.create(UserModel, {
      firstName: given_name,
      lastName: family_name,
      email,
      profileImage: picture,
      provider: ProviderEnum.GOOGLE,
    });
    const tokens = await getNewLoginCredentials(newuser);
    return successResponse(res, 201, "Done", { tokens });
  }
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  const user = await dbServices.findOne(UserModel, { email });
  if (!user) throw notFound({ message: "User not found" });

  const otp = otpGenerator();

  const generatedOtp = await generateHash({
    plainText: JSON.stringify(otp),
    algorithm: hashEnums.BCRYPT,
  });

  const updatedUser = await dbServices.updateOne(
    UserModel,
    { email, provider: ProviderEnum.SYSTEM },
    { forgetPasswordOtp: generatedOtp },
  );

  emailEvent.emit("Forget Password", {
    to: email,
    otp,
    firstName: user.firstName,
  });

  return successResponse(
    res,
    200,
    `OTP sent to your email : ${email} , Check your inbox`,
  );
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await dbServices.findOne(UserModel, {
    email,
    provider: ProviderEnum.SYSTEM,
  });
  if (!user) throw notFound({ message: "User not found" });
  const isMatch = await compareHash({
    plainText: JSON.stringify(otp),
    cliphertext: user.forgetPasswordOtp,
  });
  if (!isMatch) throw badRequest({ message: "Invalid OTP" });

  const hashedPassword = await generateHash({
    plainText: newPassword,
  });

  await dbServices.updateOne(
    UserModel,
    { email },
    { password: hashedPassword, $unset: { forgetPasswordOtp: true } },
  );

  return successResponse(res, 200, "Password reset successfully");
};
export const logout = async (req, res) => {
  const { flag } = req.body;
  let statusCode = 200;

  switch (flag) {
    case LogoutEnum.LogoutFromCurrentDevice:
      await dbServices.create(TokenModel, {
        jti: req.decodeToken.jti,
        userId: req.user._id,
        expiresIn: new Date(req.decodeToken.exp * 1000),
      });
      statusCode = 201;
      break;
    case LogoutEnum.LogoutFromAllDevices:
      await dbServices.updateOne(
        UserModel,
        { _id: req.user._id },
        { changeCridentialsTime: Date.now() },
      );
      statusCode = 200;
      break;
  }
  successResponse(res, statusCode, "Logged out successfully");
};
