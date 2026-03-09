import imageCompression from 'browser-image-compression';

/**
 * Sanitizes a filename to be safe for upload:
 * - Removes/replaces Vietnamese characters (diacritics) with ASCII equivalents
 * - Replaces spaces and special characters with underscores
 * - Keeps the file extension intact
 * - Limits the base name length to 100 chars
 */
export function sanitizeFileName(fileName: string): string {
  // Split off the extension
  const lastDot = fileName.lastIndexOf('.');
  const baseName = lastDot !== -1 ? fileName.slice(0, lastDot) : fileName;
  const ext = lastDot !== -1 ? fileName.slice(lastDot) : '';

  const sanitized = baseName
    // Normalize Unicode (NFD) then remove combining marks (diacritics)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace đ / Đ specifically (not caught by NFD normalization)
    .replace(/[đĐ]/g, 'd')
    // Replace any character that is not alphanumeric, dash, or dot with underscore
    .replace(/[^a-zA-Z0-9-.]/g, '_')
    // Collapse multiple underscores or dashes into one
    .replace(/[_-]{2,}/g, '_')
    // Trim leading/trailing underscores
    .replace(/^[_-]+|[_-]+$/g, '')
    // Limit base name length
    .slice(0, 100);

  return `${sanitized}${ext.toLowerCase()}`;
}

/**
 * Compresses an image file before upload
 * @param file The original image file
 * @param maxWidth Default 1200px
 * @param quality Default 0.8 (80%)
 */
export async function compressImage(
  file: File,
  maxWidth = 1200,
  initialQuality = 0.8
): Promise<File> {
  // If not an image, return original
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const options = {
    maxSizeMB: 1, // Aim for ~1MB max
    maxWidthOrHeight: maxWidth,
    useWebWorker: true,
    initialQuality: initialQuality,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    // Preserving the original name is important for our safeFileName logic
    return new File([compressedFile], file.name, {
      type: compressedFile.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Image compression failed:', error);
    return file; // Fallback to original
  }
}
