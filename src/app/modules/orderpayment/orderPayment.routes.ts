import express from "express";
import { orderPaymentControllers } from "./orderPayment.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { OrderPaymentSchemaValidation } from "./orderPayment.validation";
import { UserRole } from "@prisma/client";
import { productControllers } from "../product/product.controller";

const router = express.Router();

router.post(
  "/cashOnDelivary",
  auth(),
  validateRequest(OrderPaymentSchemaValidation.createOrderPaymentSchema),
  orderPaymentControllers.createOrderWithOutPayment
);
router.post(
  "/order-payment",
  auth(),
  validateRequest(OrderPaymentSchemaValidation.orderWithPaymentSchema),
  orderPaymentControllers.createOrderWithPayment
);
router.post(
  "/cancel-order",
  auth(),
  validateRequest(OrderPaymentSchemaValidation.cancelOrder),
  orderPaymentControllers.cancelOrder
);
router.post(
  "/calculate-discount",
  auth(),
  validateRequest(OrderPaymentSchemaValidation.calculateDiscountPaymentSchema),
  orderPaymentControllers.calculateDiscount
);
router.get(
  "/",
  auth(UserRole.Admin, UserRole.Staff),
  orderPaymentControllers.getAllOrderPayments
);
router.get(
  "/my-orders",
  auth(),
  orderPaymentControllers.getMyOrderFromDB
);
router.get(
  "/payment-history",
  auth(UserRole.Admin, UserRole.Staff),
  orderPaymentControllers.getPaymentHistory
);
router.delete("/delete-payment-history/:id", auth(UserRole.Admin , UserRole.Staff), orderPaymentControllers.deletePaymentHistory);

router.get(
  "/admin-overview",
  auth(UserRole.Admin, UserRole.Staff),
  orderPaymentControllers.adminOverViewData
);
router.get(
  "/admin-overview/users",
  auth(UserRole.Admin, UserRole.Staff),
  orderPaymentControllers.getUserDataForAdminOverView
);
router.get("/best-selling", productControllers.bestSelling);
router.get("/:id", orderPaymentControllers.getOrderPaymentById);
router.patch("/:id", orderPaymentControllers.updateOrderPayment);
router.delete("/:id", orderPaymentControllers.deleteOrderPayment);

export const orderPaymentRoutes = router;
