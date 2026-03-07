/**
 * Các role trong hệ thống
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  COMPANY: 'COMPANY',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Route mặc định sau khi đăng nhập theo role
 */
export const DEFAULT_ROUTES: Record<string, string> = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.COMPANY]: '/admin', // Company dùng chung admin layout, có thể tách sau
  [ROLES.USER]: '/',
};

/**
 * Lấy route mặc định theo role
 */
export function getDefaultRouteForRole(role?: string): string {
  if (!role) return '/';
  return DEFAULT_ROUTES[role] || '/';
}

