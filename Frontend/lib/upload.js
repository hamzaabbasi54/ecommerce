import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * Save an uploaded file from request.formData() to the public/uploads directory.
 * Replaces Multer's disk storage.
 *
 * @param {File} file - A File/Blob object from formData.
 * @param {string} destination - Subfolder inside public/uploads (e.g., 'products', 'profiles', 'categories', 'brands').
 * @returns {string} The public URL path to the saved file (e.g., '/uploads/products/1234-image.jpg').
 */
export async function saveUploadedFile(file, destination) {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only image files (jpeg, jpg, png, webp) are allowed');
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  // Generate unique filename
  const uniqueName = `${Date.now()}-${file.name}`;

  // Ensure directory exists
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', destination);
  await mkdir(uploadDir, { recursive: true });

  // Write the file to disk
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(uploadDir, uniqueName);
  await writeFile(filePath, buffer);

  // Return the public URL path
  return `/uploads/${destination}/${uniqueName}`;
}

/**
 * Save multiple uploaded files.
 *
 * @param {File[]} files - Array of File objects from formData.
 * @param {string} destination - Subfolder inside public/uploads.
 * @returns {string[]} Array of public URL paths.
 */
export async function saveUploadedFiles(files, destination) {
  const urls = [];
  for (const file of files) {
    const url = await saveUploadedFile(file, destination);
    urls.push(url);
  }
  return urls;
}
