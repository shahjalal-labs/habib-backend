import express from "express";
import { cuoponControllers } from "./cuopon.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { CuoponSchemaValidation } from "./cuopon.validation";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.Admin),
  validateRequest(CuoponSchemaValidation.createCuoponSchema),
  cuoponControllers.createCuopon
);
router.get("/", auth(UserRole.Admin), cuoponControllers.getAllCuopons);
router.post(
  "/send-user",
  auth(UserRole.Admin),
  validateRequest(CuoponSchemaValidation.sendCuoponSchema),
  cuoponControllers.sendCuoponToUser
);
router.get("/:id", auth(UserRole.Admin), cuoponControllers.getCuoponById);
router.patch("/:id", auth(UserRole.Admin), cuoponControllers.updateCuopon);
router.delete("/:id", auth(UserRole.Admin), cuoponControllers.deleteCuopon);

export const cuoponRoutes = router;
