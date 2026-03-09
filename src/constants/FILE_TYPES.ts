/**
 * File type categories for Cloudflare R2 upload.
 * Matches the backend enum FileType.
 */
export const FILE_TYPES = {
  PRODUCT: 'PRODUCT',
  BRAND: 'BRAND',
  CATEGORY: 'CATEGORY',
  USER: 'USER',
  OTHER: 'OTHER',
} as const;

export type FileType = (typeof FILE_TYPES)[keyof typeof FILE_TYPES];
