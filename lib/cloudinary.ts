import { v2 as cloudinary } from "cloudinary";

// CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
if (process.env.CLOUDINARY_URL) {
  cloudinary.config();
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "solar-products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result?.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Upload failed"));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

