import UserModel from "../../DB/models/User.model.js";
import * as dbServices from "../../DB/Repository/DB.Repository.js";
import { hashEnums } from "../../Utils/Enums/security.enums.js";
import {
  conflictException,
  unauthorized,
} from "../../Utils/Response/error.response.js";
import successResponse from "../../Utils/Response/success.response.js";
import { decrypt, encrypt } from "../../Utils/Security/encryption.security.js";
import {
  compareHash,
  generateHash,
} from "../../Utils/Security/hash.security.js";

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
  successResponse(res, 200, "User signed in successfully", userObj);
};
