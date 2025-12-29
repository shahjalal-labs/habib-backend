import * as z from 'zod';
 
export const createUploaderSchema = z.object({
  // Define fields
  name: z.string(),
});
 
export const UploaderSchemaValidation = {
createUploaderSchema
};
  