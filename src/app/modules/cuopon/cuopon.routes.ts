import express from "express";
import { cuoponControllers } from "./cuopon.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { CuoponSchemaValidation } from "./cuopon.validation";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.Admin, UserRole.Staff),
  validateRequest(CuoponSchemaValidation.createCuoponSchema),
  cuoponControllers.createCuopon
);
router.get("/", auth(UserRole.Admin, UserRole.Staff), cuoponControllers.getAllCuopons);
router.post(
  "/send-user",
  auth(UserRole.Admin, UserRole.Staff),
  validateRequest(CuoponSchemaValidation.sendCuoponSchema),
  cuoponControllers.sendCuoponToUser
);
router.get("/:id", auth(UserRole.Admin, UserRole.Staff), cuoponControllers.getCuoponById);
router.patch("/:id", auth(UserRole.Admin, UserRole.Staff), cuoponControllers.updateCuopon);
router.delete("/:id", auth(UserRole.Admin, UserRole.Staff), cuoponControllers.deleteCuopon);

export const cuoponRoutes = router;
