import { Router } from "express";
import * as authServices from "./auth.service.js";
import {
  authentication,
  authorization,
} from "../../Middlewares/auth.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../Utils/Enums/user.enum.js";
const router = Router();

router.post("/signup", authServices.signup);
router.post("/login", authServices.login);
router.post(
  "/refresh-token",
  authentication({ tokenType: TokenTypeEnum.REFRESH }),
  authorization({ accessRoles: [RoleEnum.ADMIN, RoleEnum.USER] }),
  authServices.refreshToken,
);
router.post(
  "/social-login",authServices.loginWithGmail,
);

export default router;
