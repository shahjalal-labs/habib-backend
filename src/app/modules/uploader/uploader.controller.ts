import { Request, Response } from 'express';
import {uploaderServices} from './uploader.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from "../../../shared/catchAsync";
 
const uploadMultipleFiles = catchAsync (async (req: Request, res: Response) => {
  const files = (req.files as { [fieldname: string]: Express.Multer.File[] })?.["gallery"];
  const result = await uploaderServices.uploadMultipleFiles(files);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Files uploaded successfully",
    data: result,
  });
})
const uploadSingleFile = catchAsync (async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File;
  const result = await uploaderServices.uploadSingleFile(file);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "File uploaded successfully",
    data: result,
  });
})

 
export const uploaderControllers = {
  uploadMultipleFiles,
  uploadSingleFile,
}
  