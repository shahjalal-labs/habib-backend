import * as z from 'zod';


export const createShippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(7, "Phone number is too short"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  zipCode: z.string().min(3, "Zip code is required"),
});


export const ShippingAddressSchemaValidation = {
createShippingAddressSchema
};