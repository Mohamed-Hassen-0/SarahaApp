import jwt from "jsonwebtoken";
import {
  EXPIRES_IN_USER_ACCESS,
  EXPIRES_IN_USER_REFRESH,
  EXPIRES_IN_ADMIN_ACCESS,
  EXPIRES_IN_ADMIN_REFRESH,
  JWT_SECRET_ADMIN_ACCESS,
  JWT_SECRET_ADMIN_REFRESH,
  JWT_SECRET_USER_ACCESS,
  JWT_SECRET_USER_REFRESH,
} from "../../../config/config.service.js";
import {
  RoleEnum,
  signtureEnum,
  TokenTypeEnum,
} from "../Enums/user.enum.js";
import { badRequest, notFound } from "../Response/error.response.js";
import { findById } from "../../DB/Repository/DB.Repository.js";
import UserModel from "../../DB/models/User.model.js";

export const generateToken = async ({ payload, secret, options }) => {
  return jwt.sign(payload, secret, options);
};

export const verifyToken = async ({ token, secret }) => {
  if (!secret) throw notFound("Secret Key Not Found");
  return jwt.verify(token, secret);
};

export const getSignture = async ({ signturelevel = signtureEnum.USER }) => {
  let signture = {
    acessSignture: undefined,
    refreshSignture: undefined,
    accessExpiresIn: undefined,
    refreshExpiresIn: undefined,
  };
  switch (signturelevel) {
    case signtureEnum.ADMIN:
      ((signture.acessSignture = JWT_SECRET_ADMIN_ACCESS),
        (signture.refreshSignture = JWT_SECRET_ADMIN_REFRESH),
        (signture.accessExpiresIn = EXPIRES_IN_ADMIN_ACCESS),
        (signture.refreshExpiresIn = EXPIRES_IN_ADMIN_REFRESH));

      break;
    default:
    case signtureEnum.USER:
      (((signture.acessSignture = JWT_SECRET_USER_ACCESS),
      (signture.refreshSignture = JWT_SECRET_USER_REFRESH)),
        (signture.accessExpiresIn = EXPIRES_IN_USER_ACCESS),
        (signture.refreshExpiresIn = EXPIRES_IN_USER_REFRESH));
      break;
  }
  return signture;
};

export const getNewLoginCredentials = async (user) => {
  const signture = await getSignture({
    signturelevel:
      user.role != RoleEnum.ADMIN ? signtureEnum.USER : signtureEnum.ADMIN,
  });

  const accessToken = await generateToken({
    payload: { id: user._id },
    secret: signture.acessSignture,
    options: { expiresIn: signture.accessExpiresIn },
  });
  const refreshToken = await generateToken({
    payload: { id: user._id },
    secret: signture.refreshSignture,
    options: { expiresIn: signture.refreshExpiresIn },
  });
  return {
    accessToken,
    refreshToken,
  };
};

export const decodedToken = async ({
  authorization,
  tokenType = TokenTypeEnum.ACCESS,
}) => {
  const [Bearer, token] = authorization.split(" ") || [];

  if (!Bearer || !token) throw badRequest({message:"invalied Token"});

  let signtrue = await getSignture({
    signturelevel: Bearer === "ADMIN" ? signtureEnum.ADMIN : signtureEnum.USER,
  });

  const decodeToken = await verifyToken({
    token,
    secret:
      tokenType === TokenTypeEnum.ACCESS
        ? signtrue.acessSignture
        : signtrue.refreshSignture,
  });

  const user = await findById(UserModel ,decodeToken.id)
  if (!user) throw notFound({message:"User Not Found"})

    return {
      user ,decodeToken
    }
};
