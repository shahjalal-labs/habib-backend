import { PrismaClient } from "@prisma/client";
import { uploadToDigitalOceanAWS } from "../../../helpers/uploadToDigitalOceanAWS";
const prisma = new PrismaClient();

const uploadMultipleFiles = async (files: Express.Multer.File[]) => {
  return await Promise.all(
    files.map(async (file: Express.Multer.File) => {
      const upload = (await uploadToDigitalOceanAWS(file)).Location;
      return upload;
    })
  );
};

const uploadSingleFile = async (file: Express.Multer.File) => {
  return (await uploadToDigitalOceanAWS(file)).Location;
};
export const uploaderServices = {
  uploadMultipleFiles,
  uploadSingleFile,
};
