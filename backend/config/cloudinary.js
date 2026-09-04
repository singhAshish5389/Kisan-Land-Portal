import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create uploads folder if not exists
const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Local Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// File Filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      ),
      false
    );
  }
};

// Multer Upload Middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
});

// Upload Image To Cloudinary
export const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "meri_khautani_profiles",
      resource_type: "image",
      transformation: [
        {
          width: 400,
          height: 400,
          crop: "limit",
        },
      ],
    });

    // Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result.secure_url;
  } catch (error) {
    // Delete local file even if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw error;
  }
};

// Delete Image From Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
  }
};

export default cloudinary;