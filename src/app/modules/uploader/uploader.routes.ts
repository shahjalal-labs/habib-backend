import express from "express";
import { uploaderControllers } from "./uploader.controller";
import { fileUploader } from "../../../helpers/fileUploadHelper";

const router = express.Router();

router.post(
  "/uplaod-multiple",
  fileUploader.uploadMultiple,
  uploaderControllers.uploadMultipleFiles
);
router.post(
  "/uplaod-single",
  fileUploader.uploadSingle,
  uploaderControllers.uploadSingleFile
);
export const uploaderRoutes = router;
