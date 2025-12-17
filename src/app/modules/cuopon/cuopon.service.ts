import prisma from "../../../shared/prisma";
import getModelKeys from "../../../helpers/getModelKeys";
import QueryBuilder from "../../builder/QueryBuilder";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { sendCuopon } from "./const";
import { emailQueue } from "../../../queue/email.queue";
import { Coupon } from "@prisma/client";

const createCuopon = async (data: Coupon) => {
  const coupon = await prisma.coupon.findUnique({
    where: {
      code: data.code,
    },
  });
  if (coupon) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Coupon already exists");
  }
  return await prisma.coupon.create({ data });
};
// send coupon
const sendCuoponToUser = async (data: sendCuopon) => {
  const coupon = await prisma.coupon.findUnique({
    where: { id: data.cuoponId },
  });

  if (!coupon) {
    throw new ApiError(httpStatus.NOT_FOUND, "Coupon doesn't exist");
  }

  if (coupon.status === "Expired" || coupon.expireDate < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Coupon is expired");
  }

  // ✅ fetch all users in one query
  const existingUsers = await prisma.user.findMany({
    where: { id: { in: data.users } },
  });
  const userMap = new Map(existingUsers.map((u) => [u.id, u]));

  // ✅ parallel processing
  await Promise.allSettled(
    data.users.map(async (userId) => {
      try {
        const existingUser = userMap.get(userId);
        if (!existingUser) {
          console.log(`User ${userId} not found. Skipped.`);
          return;
        }

        const alreadyExists = await prisma.couponUser.findFirst({
          where: { userId, couponId: data.cuoponId },
        });
        if (alreadyExists) {
          console.log(`User ${userId} already received coupon. Skipped.`);
          return;
        }

        await prisma.couponUser.create({
          data: { userId, couponId: data.cuoponId },
        });

        const expiryDate = coupon.expireDate;
        const formattedExpiry = `${expiryDate.getFullYear()}-${String(
          expiryDate.getMonth() + 1
        ).padStart(2, "0")}-${String(expiryDate.getDate()).padStart(
          2,
          "0"
        )} ${String(expiryDate.getHours()).padStart(2, "0")}:${String(
          expiryDate.getMinutes()
        ).padStart(2, "0")}:${String(expiryDate.getSeconds()).padStart(
          2,
          "0"
        )}`;

        await emailQueue.add("sendCoupon", {
          fullName: existingUser.firstName + " " + existingUser.lastName,
          couponCode: coupon.code,
          discountValue: coupon.discountValue,
          discountType : coupon.discountType,
          expiryDate: formattedExpiry,
          message: data.message,
          email: existingUser.email,
        });

        console.log(`Coupon sent to ${existingUser.email}`);
      } catch (err) {
        console.error(`Error processing user ${userId}:`, err);
      }
    })
  );
};

const getAllCuopons = async (query: any) => {
  const keys = await getModelKeys("coupon");
  const couponQuery = new QueryBuilder(prisma.coupon, query, keys);
  const result = await couponQuery
    .filter()
    .sort()
    .exclude()
    .include()
    .paginate()
    .execute();
  const pagination = await couponQuery.countTotal();
  return {
    meta: pagination,
    result,
  };
};

const getCuoponById = async (id: string) => {
  const res = await prisma.coupon.findUnique({ where: { id } });
  if (!res) {
    throw new ApiError(httpStatus.NOT_FOUND, "cuopon not Found");
  }
};

const updateCuopon = async (id: string, data: any) => {
  const isExist = await prisma.coupon.findUnique({ where: { id } });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "cuopon not Found");
  }
  return await prisma.coupon.update({ where: { id }, data });
};

const deleteCuopon = async (id: string) => {
  const isExist = await prisma.coupon.findUnique({ where: { id } });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "cuopon not Found");
  }
  return await prisma.coupon.delete({ where: { id } });
};

export const cuoponServices = {
  createCuopon,
  getAllCuopons,
  getCuoponById,
  updateCuopon,
  deleteCuopon,
  sendCuoponToUser,
};
