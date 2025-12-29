import * as z from 'zod';

// Nested schemas for Country Card Info
const countryCardInfoSchema = z.object({
  icon: z.string({ required_error: "Icon is required" }),
  title: z.string({ required_error: "Title is required" }),
  description: z.string({ required_error: "Description is required" }),
});

// Nested schemas for Country Section Info
const countrySectionInfoSchema = z.object({
  title: z.string({ required_error: "Section title is required" }),
  CountryCardInfo: z.array(countryCardInfoSchema).optional(),
});

// Country Validation Schemas with nested data
export const createCountrySchema = z.object({
    title: z.string({ required_error: "Title is required" }),
    description: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    gallary: z.array(z.string()).optional(),
    coverImage: z.string().optional(),
    CountrySectionInfo: z.array(countrySectionInfoSchema).optional(),
});

export const updateCountrySchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    gallary: z.array(z.string()).optional(),
    coverImage: z.string().optional(),
    CountrySectionInfo: z.array(countrySectionInfoSchema).optional(),
});

export const CountryLocationsSchemaValidation = {
  createCountrySchema,
  updateCountrySchema,
};
  