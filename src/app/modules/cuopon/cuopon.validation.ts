import * as z from "zod";

export const createCuoponSchema = z.object({
  code: z.string({ required_error: "cuopon code is required" }),
  discountValue: z.number({
    required_error: "please provide discounted value",
  }),
  discountType : z.enum(["Percentage", "Flat"]),
  expireDate: z.string({
    required_error: "expiry date is required ",
  }),
});


export const sendCuoponSchema = z.object({
  cuoponId: z.string({
    required_error: "cuopon is must be required!",
  }),
  users: z
  .string({
    required_error: "please share users list !",
  })
  .array(),
  message: z.string({
    required_error: "please share the message !",
  }),
});

export const CuoponSchemaValidation = {
  createCuoponSchema,
  sendCuoponSchema
};