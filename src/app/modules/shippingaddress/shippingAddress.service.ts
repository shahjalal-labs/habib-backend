import { PrismaClient, shippingAddress } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { sendSingleNotification } from "../notifications/notification.services";
const prisma = new PrismaClient();

const createShippingAddress = async (data: shippingAddress, userId: string) => {
  const userData = await prisma.user.findUnique({ where: { id: userId } });
  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const result = await prisma.shippingAddress.create({
    data: { ...data, userId: userId },
  });

  // sending the notification to user that shipping address is created successfully

  // receiverId
  // content
  // senderId
  // title
  await sendSingleNotification(
    userId,
    "Shipping Address created successfully",
    undefined,
    `Hello ${userData.firstName}, Your Shipping Address is created successfully`
  );

  return result;
};

const getMyShippingAddresss = async (userId: string) => {
  const res = await prisma.shippingAddress.findMany({
    where: {
      userId,
    },
  });

  if (!res) {
    throw new ApiError(httpStatus.NOT_FOUND, "shipping Address are  not found");
  }
  return res;
};

const getShippingAddressById = async (id: string) => {
  const res = await prisma.shippingAddress.findUnique({ where: { id } });
  if (!res) {
    throw new ApiError(httpStatus.NOT_FOUND, "product not found");
  }
  return res;
};

const updateShippingAddress = async (
  id: string,
  data: Partial<shippingAddress>,
  userId: string
) => {
  const isExist = await prisma.shippingAddress.findUnique({ where: { id } });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "product not found");
  }
  if (isExist.userId !== userId) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "you are not authorized to update this product"
    );
  }
  const result = await prisma.shippingAddress.update({ where: { id }, data });

  // Sending the notification to user that shipping address is updated successfully
  const userData = await prisma.user.findUnique({ where: { id: userId } });
  if (userData) {
    await sendSingleNotification(
      userId,
      "Shipping Address updated successfully",
      undefined,
      `Hello ${userData.firstName}, Your Shipping Address is updated successfully`
    );
  }
  return result;
};

const deleteShippingAddress = async (id: string) => {
  const isExist = await prisma.shippingAddress.findUnique({ where: { id } });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "product not found");
  }
  return await prisma.shippingAddress.delete({ where: { id } });
};

export const shippingAddressServices = {
  createShippingAddress,
  getMyShippingAddresss,
  getShippingAddressById,
  updateShippingAddress,
  deleteShippingAddress,
};
