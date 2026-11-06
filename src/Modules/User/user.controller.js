import { Router } from "express";
import * as userServices from "./user.service.js";
import {
  authentication,
  authorization,
} from "../../Middlewares/auth.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../Utils/Enums/user.enum.js";
import { localFiledUpload } from "../../Utils/multer/local.multer.js";


const router = Router();

router.get(
  "/profile",
  authentication({ tokenType: TokenTypeEnum.ACCESS }),
  authorization({ accessRoles: [RoleEnum.USER, RoleEnum.ADMIN] }),
  userServices.getProfile,
);
router.patch(
  "/update-profile-Picture",
  localFiledUpload().single("attachment"),
  userServices.updateProfilePicture,
);

export default router;
