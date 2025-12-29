import multer from "multer";

// --------------  Store in local -------------------//

const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    // 100 MB in bytes
    fileSize: 100 * 1024 * 1024,
  },
});

// Upload single images
const updateProfileImage = upload.single("avatar");
const uploadQuizImage = upload.single("quizImage");
const uploadServiceImage = upload.single("serviceImage")

// Upload multiple images for portfolio
const sendFiles = upload.fields([
  { name: "sendFiles", maxCount: 10 },
  { name: "messageFiles", maxCount: 10 },
]);

export const fileUploader = {
  sendFiles,
  updateProfileImage,
  uploadQuizImage,
  uploadServiceImage
};
