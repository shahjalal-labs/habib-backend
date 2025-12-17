import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { availability, Prisma, User } from "@prisma/client";
import stripe from "../../../helpers/stripe";
import getModelKeys from "../../../helpers/getModelKeys";
import QueryBuilder from "../../builder/QueryBuilder";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameWeek,
  isSameMonth,
  format,
  subYears,
  eachYearOfInterval,
  isSameYear,
} from "date-fns";
import { sendSingleNotification } from "../notifications/notification.services";

const createOrderWithOutPayment = async (data: any, user: JwtPayload) => {
  // 1️⃣ Validate shipping address
  const isShippingAddressExist = await prisma.shippingAddress.findUnique({
    where: { id: data.shippingAddressId },
  });

  if (!isShippingAddressExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Please add a valid shipping address."
    );
  }

  // 2️⃣ Validate products & calculate total
  let totalAmount = 0;
  const orderProductsData: Prisma.orderProductCreateManyOrderInput[] = [];

  for (const product of data.products) {
    const isProductExist = await prisma.product.findUnique({
      where: { id: product.productId },
    });

    if (!isProductExist) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Product not found! Invalid ID: ${product.productId}`
      );
    }

    if (
      isProductExist.availability === availability.OutOfStock ||
      isProductExist.availability === availability.UpComming
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `This product is not available right now: ${isProductExist.name}`
      );
    }

    if (product.quantity > isProductExist.quantity) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Requested quantity not available for product: ${isProductExist.name}`
      );
    }

    totalAmount += Number(isProductExist.price) * Number(product.quantity);

    orderProductsData.push({
      productId: product.productId,
      quantity: product.quantity,
      price: Number(isProductExist.price),
    });
  }

  let finalTotal = totalAmount;

  let couponUserId: string | null = null;
  let afterCoupon;
  if (data.couponCode) {
    afterCoupon = await cuoponApplyAndOrder(data, user, totalAmount);
    finalTotal = afterCoupon.total;
    couponUserId = afterCoupon.couponUserId;
  }

  // Create the order (single call)
  const newOrder = await prisma.order.create({
    data: {
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      userId: user.id,
      shippingAddressId: data.shippingAddressId,
      totalAmount: finalTotal,
      status: "Pending",
      isPaid: false,
      products: { createMany: { data: orderProductsData } },
    },
    include: {
      products: {
        select: {
          id: true,
          quantity: true,
          product: { select: { name: true, images: true } },
        },
      },
    },
  });

  // Delete coupon if used
  if (couponUserId) {
    await prisma.couponUser.delete({ where: { id: couponUserId } });
  }
  await sendSingleNotification(
    user.id,
    "Order Created",
    undefined,
    `Your order has been created successfully. Order ID: ${newOrder.orderId}`
  );

  return {
    message: afterCoupon?.message,
    beforeDiscount: afterCoupon?.subtotal || totalAmount,
    discount: afterCoupon?.discount || 0,
    shippingCost: afterCoupon?.shippingCost || 50,
    total: finalTotal,
    appliedCoupon: data.couponCode || null,
    order: newOrder,
  };
};

const createOrderWithPayment = async (data: any, user: JwtPayload) => {
  // userData
  const userData = (await prisma.user.findUnique({
    where: { id: user.id },
  })) as User;
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // 1️⃣ Validate shipping address
  const isShippingAddressExist = await prisma.shippingAddress.findUnique({
    where: { id: data.shippingAddressId },
  });

  if (!isShippingAddressExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Please add a valid shipping address."
    );
  }

  // 2️⃣ Validate products & calculate total
  let totalAmount = 0;
  const orderProductsData: Prisma.orderProductCreateManyOrderInput[] = [];

  for (const product of data.products) {
    const isProductExist = await prisma.product.findUnique({
      where: { id: product.productId },
    });

    if (!isProductExist) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Product not found! Invalid ID: ${product.productId}`
      );
    }

    if (
      isProductExist.availability === availability.OutOfStock ||
      isProductExist.availability === availability.UpComming
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `This product is not available right now: ${isProductExist.name}`
      );
    }

    if (product.quantity > isProductExist.quantity) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Requested quantity not available for product: ${isProductExist.name}`
      );
    }

    totalAmount += Number(isProductExist.price) * Number(product.quantity);

    orderProductsData.push({
      productId: product.productId,
      quantity: product.quantity,
      price: Number(isProductExist.price),
    });
  }

  let finalTotal = totalAmount;
  let couponUserId: string | null = null;
  let afterCoupon: any;

  if (data.couponCode) {
    afterCoupon = await cuoponApplyAndOrder(data, user, totalAmount);
    finalTotal = afterCoupon.total; // Use total after discount
    couponUserId = afterCoupon.couponUserId;
  }

  let newOrder: any;
  let customer: any;
  if (userData.customerId) {
    customer = { id: userData.customerId };
  } else {
    const newCustomer = await stripe.customers.create({
      email: userData.email || "no-email@freemanzllc.com",
      name: user.userName || "Unknown User",
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { customerId: newCustomer.id },
    });

    customer = newCustomer;
  }

  await stripe.paymentMethods.attach(data.paymentMethodId, {
    customer: customer.id,
  });

  // 3️⃣ Create Stripe PaymentIntent with finalTotal
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalTotal * 100), // ⚠️ use finalTotal instead of totalAmount
      currency: "usd",
      customer: customer.id, 
      payment_method: data.paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });
    if (paymentIntent.status === "succeeded") {
      newOrder = await prisma.order.create({
        data: {
          orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          userId: user.id,
          shippingAddressId: data.shippingAddressId,
          paymentMethodId: data.paymentMethodId,
          paymentIntentId: paymentIntent.id,
          totalAmount: finalTotal, // ⚠️ use finalTotal here too
          status: "Processed",
          isPaid: true,
          products: { createMany: { data: orderProductsData } },
        },
        include: {
          products: {
            select: {
              id: true,
              quantity: true,
              product: { select: { name: true, images: true } },
            },
          },
        },
      });

      // Delete coupon after one-time use
      if (couponUserId) {
        await prisma.couponUser.delete({ where: { id: couponUserId } });
      }
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "Payment not successful");
    }
  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }

  await sendSingleNotification(
    user.id,
    "Order Created and with received payment",
    undefined,
    `Your order has been created successfully. Order ID: ${newOrder.orderId}`
  );

  // 5️⃣ Return order + discount info
  return {
    message: afterCoupon?.message,
    beforeDiscount: afterCoupon?.subtotal || totalAmount,
    discount: afterCoupon?.discount || 0,
    shippingCost: afterCoupon?.shippingCost || 50,
    total: finalTotal,
    order: newOrder,
  };
};

// shipping cost
// Calculate discount with coupon
const calculateDiscount = async (
  data: {
    products: { productId: string; quantity: number }[];
    couponCode: string;
  },
  userId: string
) => {
  // 1️⃣ Fetch all products in one query
  const productIds = data.products.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== productIds.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "One or more products not found!"
    );
  }

  // 2️⃣ Validate products & calculate total
  let totalAmount = 0;
  for (const item of data.products) {
    const product = products.find((p) => p.id === item.productId)!;
    if (
      product.availability === availability.OutOfStock ||
      product.availability === availability.UpComming
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Product not available: ${product.name}`
      );
    }
    if (item.quantity > product.quantity) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Not enough stock for: ${product.name}`
      );
    }
    totalAmount += Number(product.price) * Number(item.quantity);
  }

  // 3️⃣ Validate coupon
  const couponUser = await prisma.couponUser.findFirst({
    where: {
      coupon: { code: data.couponCode },
      userId,
    },
    include: { coupon: true },
  });

  const shippingCost = Number(process.env.SHIPPING_COST) || 50;
  if (!couponUser?.coupon) {
    return {
      success: false,
      message: "Invalid coupon!",
      statusCode: httpStatus.BAD_REQUEST,
      subtotal: totalAmount,
      discount: 0,
      afterDiscountAmount: totalAmount,
      shippingCost: shippingCost,
      total: totalAmount + shippingCost,
    };
  }

  const coupon = couponUser.coupon;
  const isExpiredByDate = coupon.expireDate < new Date();
  // Check status
  const isInvalidStatus = ["Expired", "Inactive"].includes(coupon.status);

  if (isExpiredByDate || isInvalidStatus) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      isExpiredByDate
        ? "Coupon expired by date"
        : `Coupon is ${coupon.status.toLowerCase()}`
    );
  }

  // 4️⃣ Apply discount (support % or flat)
  let discountApplied = 0;
  if (coupon.discountType === "Percentage") {
    discountApplied = (totalAmount * coupon.discountValue) / 100;
  } else if (coupon.discountType === "Flat") {
    discountApplied = coupon.discountValue;
  }
  return {
    success: true,
    message: "Coupon applied successfully",
    statusCode: httpStatus.OK,
    subtotal: totalAmount,
    discount: discountApplied,
    afterDiscountAmount: totalAmount - discountApplied,
    shippingCost: shippingCost,
    total: totalAmount - discountApplied + shippingCost,
  };
};

const cancelOrder = async (
  data: { orderId: string; cancelReason: string },
  user: JwtPayload
) => {
  // 1️⃣ Find order
  const order = await prisma.order.findUnique({ where: { id: data.orderId } });
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  if (order.status === "Cancelled")
    throw new ApiError(httpStatus.BAD_REQUEST, "Order already cancelled");

  // 2️⃣ Check user permission
  if (order.userId !== user.id)
    throw new ApiError(httpStatus.FORBIDDEN, "Not allowed");

  // 3️⃣ Check 48 hours limit
  const now = new Date();
  const orderTime = new Date(order.createdAt);
  const diffHours = (now.getTime() - orderTime.getTime()) / (1000 * 60 * 60);
  if (diffHours > 48) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Order cannot be cancelled after 48 hours"
    );
  }

  // 4️⃣ Refund if payment done
  if (order.isPaid && order.paymentIntentId) {
    try {
      await stripe.refunds.create({ payment_intent: order.paymentIntentId });
    } catch (err: any) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Refund failed: " + err.message
      );
    }
  }

  // 5️⃣ Update order status
  await prisma.order.update({
    where: { id: data.orderId },
    data: {
      status: "Cancelled",
      cancelReason: data.cancelReason,
    },
  });

  await sendSingleNotification(
    user.id,
    "Order Cancelled",
    undefined,
    `Your order has been cancelled successfully. Order ID: ${data.orderId}`
  );

  return;
};

const getAllOrderPayments = async (query: any) => {
  const keys = await getModelKeys("order");
  const usersQuery = new QueryBuilder(prisma.order, query, keys);
  const result = await usersQuery
    .search(["user.firstName", "user.lastName", "user.email"])
    .sort()
    .fields()
    .filter()
    .exclude()
    .include({
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      products: {
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              availability: true,
              quantity: true,
            },
          },
        },
      },
    })
    .paginate()
    .execute();
  const pagination = await usersQuery.countTotal();
  return {
    meta: pagination,
    result,
  };
};

const getMyOrderFromDB = async (query: any, userId: string) => {
  const keys = await getModelKeys("order");
  const usersQuery = new QueryBuilder(prisma.order, query, keys);

  const result = await usersQuery
    .setCustomWhere({
      userId,
    })
    .sort()
    .fields()
    .filter()
    .exclude()
    .include({
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      products: {
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              availability: true,
              quantity: true,
            },
          },
        },
      },
    })
    .paginate()
    .execute();

  const pagination = await usersQuery.countTotal();

  return {
    meta: pagination,
    result,
  };
};

const getPaymentHistory = async (query: any) => {
  const keys = await getModelKeys("order");
  const usersQuery = new QueryBuilder(prisma.order, query, keys);
  const result = await usersQuery
    .setCustomWhere({
      isPaid: true,
      status: {
        not: "Cancelled",
      },
    })
    .search(["user.firstName", "user.lastName", "user.email"])
    .sort()
    .fields()
    .filter()
    .exclude()
    .include({
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      products: {
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              availability: true,
              quantity: true,
            },
          },
        },
      },
    })
    .paginate()
    .execute();
  const pagination = await usersQuery.countTotal();
  return {
    meta: pagination,
    result,
  };
};

const getOrderPaymentById = async (id: string) => {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              availability: true,
              quantity: true,
            },
          },
        },
      },
      shippingAddress: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
};

const updateOrderPayment = async (id: string, data: any) => {
  console.log("first");
  return await prisma.order.update({ where: { id }, data });
};

const deleteOrderPayment = async (id: string) => {
  // return await prisma.orderPayment.delete({ where: { id } });
};

const cuoponApplyAndOrder = async (
  data: any,
  user: JwtPayload,
  totalAmount: number
) => {
  const couponUser = await prisma.couponUser.findFirst({
    where: {
      coupon: { code: data.couponCode },
      userId: user.id,
    },
    include: { coupon: true },
  });

  const shippingCost = Number(process.env.SHIPPING_COST) || 50;
  if (!couponUser?.coupon) {
    return {
      success: false,
      message: "Invalid coupon!",
      statusCode: httpStatus.BAD_REQUEST,
      subtotal: totalAmount,
      discount: 0,
      afterDiscountAmount: totalAmount,
      shippingCost: shippingCost,
      couponUserId: null,
      total: totalAmount + shippingCost,
    };
  }

  const coupon = couponUser.coupon;
  const isExpiredByDate = coupon.expireDate < new Date();
  // Check status
  const isInvalidStatus = ["Expired", "Inactive"].includes(coupon.status);

  if (isExpiredByDate || isInvalidStatus) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      isExpiredByDate
        ? "Coupon expired by date"
        : `Coupon is ${coupon.status.toLowerCase()}`
    );
  }

  // 4️⃣ Apply discount (support % or flat)
  let discountApplied = 0;
  if (coupon.discountType === "Percentage") {
    discountApplied = (totalAmount * coupon.discountValue) / 100;
  } else if (coupon.discountType === "Flat") {
    discountApplied = coupon.discountValue;
  }
  return {
    success: true,
    message: "Coupon applied successfully",
    statusCode: httpStatus.OK,
    subtotal: totalAmount,
    discount: discountApplied,
    afterDiscountAmount: totalAmount - discountApplied,
    shippingCost: shippingCost,
    couponUserId: couponUser.id,
    total: totalAmount - discountApplied + shippingCost,
  };
};

const adminOverViewData = async (
  filter: "daily" | "weekly" | "monthly" | "yearly"
) => {
  const now = new Date();
  let interval;

  if (filter === "daily") {
    interval = {
      start: startOfWeek(now, { weekStartsOn: 0 }),
      end: endOfWeek(now, { weekStartsOn: 0 }),
    };
  } else if (filter === "weekly") {
    interval = {
      start: startOfMonth(now),
      end: endOfMonth(now),
    };
  } else if (filter === "monthly") {
    interval = {
      start: startOfYear(now),
      end: endOfYear(now),
    };
  } else if (filter === "yearly") {
    interval = {
      start: subYears(startOfYear(now), 4), // 🔥 last 5 years (current year + 4 back)
      end: endOfYear(now),
    };
  } else {
    throw new Error("Invalid filter");
  }

  // ✅ Parallel queries
  const [totalRevenueAgg, totalOrders, totalCustomers, orderStats, bookings] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: "Delivered" },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "User" } }),
      prisma.order.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.order.findMany({
        where: {
          isPaid: true,
          createdAt: {
            gte: interval.start,
            lte: interval.end,
          },
        },
        select: {
          totalAmount: true,
          createdAt: true,
          status: true,
        },
      }),
    ]);

  // ✅ Pie Chart Data
  const statusCounts = orderStats.reduce<Record<string, number>>((acc, cur) => {
    acc[cur.status] = cur._count;
    return acc;
  }, {});

  const ringChartData = {
    delivered: statusCounts["Delivered"] ?? 0,
    inRoute: statusCounts["InRoute"] ?? 0,
    pending: statusCounts["Pending"] ?? 0,
    cancelled: statusCounts["Cancelled"] ?? 0,
  };

  // ✅ Revenue Chart
  let chartData: {
    label: string;
    revenue: number;
    delivered: number;
    cancelled: number;
  }[] = [];

  if (filter === "daily") {
    const days = eachDayOfInterval(interval);

    chartData = days.map((day) => {
      const dailyOrders = bookings.filter((b) => isSameDay(b.createdAt, day));

      const revenue = dailyOrders.reduce(
        (sum, booking) => sum + (booking.totalAmount || 0),
        0
      );

      const delivered = dailyOrders.filter(
        (b) => b.status === "Delivered"
      ).length;

      const cancelled = dailyOrders.filter(
        (b) => b.status === "Cancelled"
      ).length;

      return {
        label: format(day, "EEE"),
        revenue,
        delivered,
        cancelled,
      };
    });
  }

  if (filter === "weekly") {
    const weeks = eachWeekOfInterval(interval, { weekStartsOn: 0 });

    chartData = weeks.map((weekStart, i) => {
      const weeklyOrders = bookings.filter((b) =>
        isSameWeek(b.createdAt, weekStart, { weekStartsOn: 0 })
      );

      const revenue = weeklyOrders.reduce(
        (sum, booking) => sum + (booking.totalAmount || 0),
        0
      );

      const delivered = weeklyOrders.filter(
        (b) => b.status === "Delivered"
      ).length;

      const cancelled = weeklyOrders.filter(
        (b) => b.status === "Cancelled"
      ).length;

      return {
        label: `Week ${i + 1}`,
        revenue,
        delivered,
        cancelled,
      };
    });
  }

  if (filter === "monthly") {
    const months = eachMonthOfInterval(interval);

    chartData = months.map((month) => {
      const monthlyOrders = bookings.filter((b) =>
        isSameMonth(b.createdAt, month)
      );

      const revenue = monthlyOrders.reduce(
        (sum, booking) => sum + (booking.totalAmount || 0),
        0
      );

      const delivered = monthlyOrders.filter(
        (b) => b.status === "Delivered"
      ).length;

      const cancelled = monthlyOrders.filter(
        (b) => b.status === "Cancelled"
      ).length;

      return {
        label: format(month, "MMMM"),
        revenue,
        delivered,
        cancelled,
      };
    });
  }

  if (filter === "yearly") {
    const years = eachYearOfInterval(interval);

    chartData = years.map((year) => {
      const yearlyOrders = bookings.filter((b) =>
        isSameYear(b.createdAt, year)
      );

      const revenue = yearlyOrders.reduce(
        (sum, booking) => sum + (booking.totalAmount || 0),
        0
      );

      const delivered = yearlyOrders.filter(
        (b) => b.status === "Delivered"
      ).length;

      const cancelled = yearlyOrders.filter(
        (b) => b.status === "Cancelled"
      ).length;

      return {
        label: format(year, "yyyy"),
        revenue,
        delivered,
        cancelled,
      };
    });
  }

  // ✅ Final Response
  return {
    summary: {
      totalRevenue: totalRevenueAgg._sum.totalAmount ?? 0,
      deliveredOrders: totalRevenueAgg._count,
      totalCustomers,
      totalOrders,
    },
    ringChartData,
    revenueChart: {
      filter,
      totalRevenue: bookings.reduce(
        (sum, booking) => sum + (booking.totalAmount || 0),
        0
      ),
      chartData,
    },
  };
};

const getUserDataForAdminOverView = async (
  filter: "daily" | "weekly" | "monthly" | "yearly"
) => {
  const now = new Date();
  let interval;

  if (filter === "daily") {
    interval = {
      start: startOfWeek(now, { weekStartsOn: 0 }),
      end: endOfWeek(now, { weekStartsOn: 0 }),
    };
  } else if (filter === "weekly") {
    interval = {
      start: startOfMonth(now),
      end: endOfMonth(now),
    };
  } else if (filter === "monthly") {
    interval = {
      start: startOfYear(now),
      end: endOfYear(now),
    };
  } else if (filter === "yearly") {
    interval = {
      start: subYears(startOfYear(now), 4), // 🔥 last 5 years (current year + 4 back)
      end: endOfYear(now),
    };
  } else {
    throw new Error("Invalid filter");
  }

  const users = await prisma.user.findMany({
    where: {
      role: "User",
      createdAt: {
        gte: interval.start,
        lte: interval.end,
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      phone: true,
      zipCode: true,
      createdAt: true,
    },
  });

  let chartData: {
    label: string;
    value: number;
  }[] = [];

  if (filter === "daily") {
    const days = eachDayOfInterval(interval);

    chartData = days.map((day) => {
      const dailyUsers = users.filter((u) => isSameDay(u.createdAt, day));

      return {
        label: format(day, "EEE"), // Mon, Tue, Wed
        value: dailyUsers.length,
      };
    });
  }

  if (filter === "weekly") {
    const weeks = eachWeekOfInterval(interval, { weekStartsOn: 0 });

    chartData = weeks.map((weekStart, i) => {
      const weeklyUsers = users.filter((u) =>
        isSameWeek(u.createdAt, weekStart, { weekStartsOn: 0 })
      );

      return {
        label: `Week ${i + 1}`,
        value: weeklyUsers.length,
      };
    });
  }

  if (filter === "monthly") {
    const months = eachMonthOfInterval(interval);

    chartData = months.map((month) => {
      const monthlyUsers = users.filter((u) => isSameMonth(u.createdAt, month));

      return {
        label: format(month, "MMMM"), // January, February
        value: monthlyUsers.length,
      };
    });
  }

  if (filter === "yearly") {
    const years = eachYearOfInterval(interval);

    chartData = years.map((year) => {
      const yearlyUsers = users.filter((u) => isSameYear(u.createdAt, year));

      return {
        label: format(year, "yyyy"),
        value: yearlyUsers.length,
      };
    });
  }
  return {
    filter,
    chartData,
    lastTenUsers: users.slice(-10).reverse(),
  };
};

export const orderPaymentServices = {
  createOrderWithOutPayment,
  getAllOrderPayments,
  getOrderPaymentById,
  updateOrderPayment,
  deleteOrderPayment,
  createOrderWithPayment,
  cancelOrder,
  getPaymentHistory,
  calculateDiscount,
  getMyOrderFromDB,
  adminOverViewData,
  getUserDataForAdminOverView,
};
