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

/**
 * Upload a document (PDF, etc.) to Cloudinary
 * @param file - The file to upload
 * @param folder - Optional folder path (default: "order-documents")
 * @returns Promise resolving to the secure URL of the uploaded document
 */
export async function uploadDocument(file: File, folder: string = "order-documents"): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Get original filename
  const originalFilename = file.name;
  
  // Clean base name for public_id (alphanumeric, hyphens, underscores only)
  const baseName = originalFilename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace special chars
    .substring(0, 100); // Limit length

  // Generate unique public_id with timestamp
  // Format: folder/baseName_timestamp
  // Cloudinary will handle file type detection automatically
  const timestamp = Date.now();
  const publicId = `${folder}/${baseName}_${timestamp}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto", // Let Cloudinary decide - often results in better metadata for PDFs
        public_id: publicId, // Explicit public_id with full path (includes folder)
        access_mode: "public", // Ensure deliverable (publicly accessible)
        use_filename: false, // We're setting public_id explicitly
        unique_filename: true, // Ensure uniqueness
        overwrite: false, // Don't overwrite
        // Note: Don't set 'folder' when public_id already includes the full path to avoid duplication
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else if (result?.secure_url) {
          // Return the secure URL - this is the direct download URL
          // With resource_type: "auto", Cloudinary may store PDFs as images with metadata
          resolve(result.secure_url);
        } else {
          reject(new Error("Document upload failed: No URL returned"));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Upload multiple files to Cloudinary
 * @param files - Array of files to upload
 * @param folder - Optional folder path (default: "order-documents")
 * @param resourceType - "image" or "raw" (default: "raw" for documents)
 * @returns Promise resolving to an array of secure URLs
 */
export async function uploadMultipleFiles(
  files: File[],
  folder: string = "order-documents",
  resourceType: "image" | "raw" = "raw"
): Promise<string[]> {
  const uploadPromises = files.map((file) => {
    if (resourceType === "image") {
      return uploadImage(file);
    } else {
      return uploadDocument(file, folder);
    }
  });

  return Promise.all(uploadPromises);
}

/**
 * Upload a file with automatic resource type detection
 * @param file - The file to upload
 * @param folder - Optional folder path
 * @returns Promise resolving to the secure URL
 */
export async function uploadFile(file: File, folder: string = "order-documents"): Promise<string> {
  const fileType = file.type;
  
  // Determine resource type based on MIME type
  if (fileType.startsWith("image/")) {
    return uploadImage(file);
  } else {
    return uploadDocument(file, folder);
  }
}
