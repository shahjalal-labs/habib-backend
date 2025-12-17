//@ts-nocheck
const authLoginIntoDB = async (payload: User) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: payload.email || undefined },
        { appleId: payload.appleId || undefined },
      ],
    },
  });
  if (user) {
    if (user.status === "Deleted") {
      throw new ApiError(
        400,
        "Your account already deleted, please contact Admin"
      );
    }
    const accessToken = jwtHelpers.generateToken(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.jwt_secret as string,
      config.jwt.expires_in as string
    );
    // save the FCM Token
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        fcmToken: payload.fcmToken,
      },
    });

    return {
      accessToken,
      id: user.id,
      role: user.role,
    };
  } else if (!payload.role || (!payload.appleId && !payload.email)) {
    console.log(!payload.role)
    // frontend hanlde this msg for checking - thats'y
    throw new ApiError(400, "please provide role and userName");
  } else {
    const plainPassword = "123456";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const user = await prisma.user.create({
      data: {
        ...payload,
        password: hashedPassword,
      },
    });

    const accessToken = jwtHelpers.generateToken(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.jwt_secret as string,
      config.jwt.expires_in as string
    );

    return {
      accessToken,
      id: user.id,
      role: user.role,
    };
  }
};