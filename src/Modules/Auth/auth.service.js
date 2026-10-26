import { CLIENT_ID } from "../../../config/config.service.js";
import UserModel from "../../DB/models/User.model.js";
import * as dbServices from "../../DB/Repository/DB.Repository.js";
import { hashEnums } from "../../Utils/Enums/security.enums.js";
import { ProviderEnum } from "../../Utils/Enums/user.enum.js";
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
import {
  getNewLoginCredentials,
  verifyToken,
} from "../../Utils/token/token.js";

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
  successResponse(res, 201, "User created successfully", userObj);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await dbServices.findOne(UserModel, { email }, "+password");
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
