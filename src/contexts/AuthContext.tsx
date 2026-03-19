import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  authService,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getUserData,
  setUserData,
} from '../services';
import {
  AuthState,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '../types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string,
    phoneNumber?: string
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Parse JWT to get user info (without verification - just decode)
interface JwtPayload extends Partial<AuthUser> {
  roles?: string[];
}

const parseJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

// Normalize role from multiple JWT claim formats
const extractRoleFromClaims = (claims: Record<string, unknown>): string => {
  const normalize = (value: string): string =>
    value.replace(/^ROLE_/i, '').toUpperCase();

  // Common string role claim
  if (typeof claims.role === 'string' && claims.role.trim()) {
    return normalize(claims.role);
  }

  // Array role claims: roles, authorities
  const pickFromArray = (arr: unknown): string | null => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const first = arr.find((v) => typeof v === 'string' && v.trim());
    return typeof first === 'string' ? normalize(first) : null;
  };

  const roleFromRoles = pickFromArray(claims.roles);
  if (roleFromRoles) return roleFromRoles;

  const roleFromAuthorities = pickFromArray(claims.authorities);
  if (roleFromAuthorities) return roleFromAuthorities;

  // OAuth scope claim (space-separated)
  if (typeof claims.scope === 'string' && claims.scope.trim()) {
    const scopeParts = claims.scope.split(/\s+/).map((s) => normalize(s));
    if (scopeParts.includes('COMPANY')) return 'COMPANY';
    if (scopeParts.length > 0) return scopeParts[0];
  }

  return 'USER';
};

// Get stored auth state from localStorage
const getStoredAuthState = (): Partial<AuthState> => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (accessToken) {
    // Prefer persisted user data (set during login) over JWT parsing
    const savedUser = getUserData();
    if (savedUser && savedUser.userId) {
      return {
        accessToken,
        refreshToken,
        isAuthenticated: true,
        user: {
          userId: savedUser.userId,
          email: savedUser.email,
          fullName: savedUser.fullName,
          role: savedUser.role,
          phoneNumber: savedUser.phoneNumber,
          name: savedUser.fullName,
          phone: savedUser.phoneNumber,
          points: 0,
          companyId: savedUser.companyId,
        } as AuthUser,
      };
    }

    // Fallback: decode JWT claims
    const decoded = parseJwt(accessToken);
    if (decoded) {
      const claims = decoded as Record<string, unknown>;
      const role = extractRoleFromClaims(claims);
      const userId =
        (typeof claims.userId === 'number' && claims.userId) ||
        (typeof claims.id === 'number' && claims.id) ||
        (typeof claims.sub === 'string' && /^\d+$/.test(claims.sub)
          ? Number(claims.sub)
          : 0);

      return {
        accessToken,
        refreshToken,
        isAuthenticated: true,
        user: {
          userId,
          email:
            (typeof claims.email === 'string' ? claims.email : '') ||
            (typeof claims.sub === 'string' && claims.sub.includes('@')
              ? claims.sub
              : ''),
          fullName:
            (typeof claims.fullName === 'string' ? claims.fullName : '') ||
            (typeof claims.name === 'string' ? claims.name : '') ||
            '',
          role,
          phoneNumber:
            typeof claims.phoneNumber === 'string'
              ? claims.phoneNumber
              : undefined,
          companyId:
            typeof claims.companyId === 'number'
              ? claims.companyId
              : undefined,
          // Backward compatible aliases
          name:
            (typeof claims.fullName === 'string' ? claims.fullName : '') ||
            (typeof claims.name === 'string' ? claims.name : '') ||
            '',
          phone:
            typeof claims.phoneNumber === 'string'
              ? claims.phoneNumber
              : undefined,
          points:
            typeof claims.rewardPoint === 'number' ? claims.rewardPoint : 0,
        } as AuthUser,
      };
    }
  }

  return {
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    user: null,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Khởi tạo hoàn toàn đồng bộ từ localStorage — không cần useEffect
  const [state, setState] = useState<AuthState>(() => {
    const stored = getStoredAuthState();
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false, // luôn false vì đọc localStorage là đồng bộ
      error: null,
      ...stored,
    };
  });

  // Listen for auth:logout event from API interceptor
  useEffect(() => {
    const handleLogout = () => {
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      });
    };

    const handleRefreshed = (
      event: CustomEvent<{ accessToken: string; refreshToken: string }>
    ) => {
      setState((prev) => ({
        ...prev,
        accessToken: event.detail.accessToken,
        refreshToken: event.detail.refreshToken,
        isAuthenticated: true,
      }));
    };

    const handleForbidden = (event: CustomEvent<{ message: string }>) => {
      setState((prev) => ({
        ...prev,
        error: event.detail.message,
      }));
    };

    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('auth:forbidden', handleForbidden as EventListener);
    window.addEventListener('auth:refreshed', handleRefreshed as EventListener);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener(
        'auth:forbidden',
        handleForbidden as EventListener
      );
      window.removeEventListener(
        'auth:refreshed',
        handleRefreshed as EventListener
      );
    };
  }, []);

  // Helper to extract error message from API response
  const extractErrorMessage = (error: unknown): string => {
    if (typeof error === 'string') return error;

    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as any).response;
      const data = response?.data;

      // Handle Spring Boot Validation Errors (MethodArgumentNotValidException)
      // Format: { status: 400, errors: [{ defaultMessage: "..." }] }
      if (
        data?.errors &&
        Array.isArray(data.errors) &&
        data.errors.length > 0
      ) {
        return (
          data.errors[0].defaultMessage ||
          data.errors[0].message ||
          'Dữ liệu không hợp lệ'
        );
      }

      // Handle standard API response error message
      // Handle standard API response error message
      if (data?.message) {
        if (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
          // Case where errors are in 'data' field as key-value pairs (e.g. { shippingAddress: '...' })
          const errorDetails = Object.values(data.data).join('. ');
          return `${data.message}: ${errorDetails}`;
        }
        return data.message;
      }

      // Handle generic Spring Boot error
      if (data?.error) return data.error;

      return `Lỗi ${response?.status}: ${response?.statusText || 'Không xác định'}`;
    }

    return error instanceof Error
      ? error.message
      : 'Có lỗi xảy ra. Vui lòng thử lại.';
  };

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const credentials: LoginRequest = { email, password };
        const authData = await authService.login(credentials);

        setUserData({
          userId: authData.userId,
          email: authData.email,
          fullName: authData.fullName,
          role: authData.role,
          companyId: authData.companyId,
        });

        setState({
          user: {
            userId: authData.userId,
            email: authData.email,
            fullName: authData.fullName,
            phoneNumber: authData.phoneNumber,
            address: authData.address,
            role: authData.role,
            // Backward compatible aliases
            name: authData.fullName,
            phone: authData.phoneNumber,
            points: authData.rewardPoint || 0,
            companyId: authData.companyId,
          },
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage = extractErrorMessage(error);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  const googleLogin = useCallback(async (token: string): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const authData = await authService.googleLogin(token);

      setUserData({
        userId: authData.userId,
        email: authData.email,
        fullName: authData.fullName,
        role: authData.role,
      });

      setState({
        user: {
          userId: authData.userId,
          email: authData.email,
          fullName: authData.fullName,
          phoneNumber: authData.phoneNumber,
          address: authData.address,
          role: authData.role,
          // Backward compatible aliases
          name: authData.fullName,
          phone: authData.phoneNumber,
          points: authData.rewardPoint || 0,
        },
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = extractErrorMessage(error);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const register = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
      phoneNumber?: string
    ): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const userData: RegisterRequest = {
          fullName,
          email,
          password,
          phoneNumber,
        };
        const authData = await authService.register(userData);

        setUserData({
          userId: authData.userId,
          email: authData.email,
          fullName: authData.fullName,
          role: authData.role,
          phoneNumber,
        });

        setState({
          user: {
            userId: authData.userId,
            email: authData.email,
            fullName: authData.fullName,
            role: authData.role,
            phoneNumber: phoneNumber,
            // Backward compatible aliases
            name: authData.fullName,
            phone: phoneNumber,
            points: 0,
          },
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage = extractErrorMessage(error);

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    []
  );

  const logout = useCallback(() => {
    authService.logout();
    clearTokens();
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const refreshUser = useCallback(() => {
    const savedUser = getUserData();
    if (savedUser) {
      setState((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          ...savedUser,
          fullName: savedUser.fullName,
          phoneNumber: savedUser.phoneNumber,
          name: savedUser.fullName,
          phone: savedUser.phoneNumber,
        } as AuthUser,
      }));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        googleLogin,
        register,
        logout,
        clearError,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
