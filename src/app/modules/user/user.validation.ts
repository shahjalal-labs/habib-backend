import { z } from "zod";

const userRegisterValidationSchema = z.object({
  firstName: z.string().min(1, "first name is required"),
  lastName: z.string().min(1, "last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Dashboard
// OrderManagement
// ProductManagement
// CategoriesManagement
// UsersManagement
// CouponsManagement

const stuffRegistrationValidationSchema = z.object({
  firstName: z.string().min(1, "first name is required"),
  lastName: z.string().min(1, "last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  accessiblePages: z
    .array(
      z.enum([
        "Dashboard",
        "OrderManagement",
        "ProductManagement",
        "CategoriesManagement",
        "UsersManagement",
        "CouponsManagement",
      ])
    )
    .optional(),
});

export const userValidation = {
  userRegisterValidationSchema,
  stuffRegistrationValidationSchema,
};