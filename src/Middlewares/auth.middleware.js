import { TokenTypeEnum } from "../Utils/Enums/user.enum.js";
import { unauthorized } from "../Utils/Response/error.response.js";
import { decodedToken } from "../Utils/token/token.js";

export const authentication = ({ tokenType = TokenTypeEnum.ACCESS }) => {
  return async (req, res, next) => {ذ
    const { user, decodeToken } = await decodedToken({
      authorization: req.headers.authorization,
      tokenType,
    });

    req.user = user;
    req.decodeToken = decodeToken;

    return next();
  };
};

export const authorization = ({accessRoles = ["USER"]}) => {
  return async (req, res, next) => {

    if(!accessRoles.includes(req.user.role)) throw unauthorized({message:"You Are Not Authorized To perform This Action"})


    return next();
  };
};
