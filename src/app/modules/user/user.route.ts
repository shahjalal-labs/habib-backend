import express from "express";
import { UserControllers } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { userValidation } from "./user.validation";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../../helpers/fileUploadHelper";
import { parseBodyData } from "../../middlewares/parseBodyData";

const router = express.Router();

router.post(
  "/request",
  validateRequest(userValidation.userRegisterValidationSchema),
  UserControllers.createPendingUser
);
router.post("/otp-resend", UserControllers.resendOTP);
router.post("/create", UserControllers.createUser);
router.get("/", auth(UserRole.Admin, UserRole.Staff), UserControllers.getUsers);
router.get("/single/:id", UserControllers.getSingleUser);
router.delete(
  "/delete-user/:id",
  auth(UserRole.Admin, UserRole.Staff),
  UserControllers.deleteUser
);
router.delete("/", auth(), UserControllers.deleteMyAccount);
router.patch(
  "/update-user/:userId",
  auth(UserRole.Admin, UserRole.Staff),
  fileUploader.profileImage,
  parseBodyData,
  UserControllers.updateUser
);
router.get(
  "/admin-overview",
  auth(UserRole.Admin, UserRole.Staff),
  UserControllers.adminOverview
);


//** ========================== STAFF MANAGEMENT ======================== */

router.post(
  "/create-staff",
  auth(UserRole.Admin),
  validateRequest(userValidation.stuffRegistrationValidationSchema),
  UserControllers.createStaffUser
);


export const userRoutes = router;
