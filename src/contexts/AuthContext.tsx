import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { authService, getAccessToken, getRefreshToken, clearTokens } from '../services';
import { AuthUser, AuthState, LoginRequest, RegisterRequest } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, phoneNumber?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Parse JWT to get user info (without verification - just decode)
const parseJwt = (token: string): Partial<AuthUser> | null => {
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

// Get stored auth state from localStorage
const getStoredAuthState = (): Partial<AuthState> => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (accessToken) {
    const decoded = parseJwt(accessToken);
    if (decoded) {
      return {
        accessToken,
        refreshToken,
        isAuthenticated: true,
        user: {
          userId: decoded.userId || 0,
          email: decoded.email || '',
          fullName: decoded.fullName || '',
          role: decoded.role || 'USER',
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
  const [state, setState] = useState<AuthState>(() => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    ...getStoredAuthState(),
  }));

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedState = getStoredAuthState();
    setState(prev => ({
      ...prev,
      ...storedState,
      isLoading: false,
    }));
  }, []);

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

    const handleForbidden = (event: CustomEvent<{ message: string }>) => {
      setState(prev => ({
        ...prev,
        error: event.detail.message,
      }));
    };

    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('auth:forbidden', handleForbidden as EventListener);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('auth:forbidden', handleForbidden as EventListener);
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
      if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors[0].defaultMessage || data.errors[0].message || 'Dữ liệu không hợp lệ';
      }

      // Handle standard API response error message
      if (data?.message) return data.message;

      // Handle generic Spring Boot error
      if (data?.error) return data.error;

      return `Lỗi ${response?.status}: ${response?.statusText || 'Không xác định'}`;
    }

    return error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.';
  };

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const credentials: LoginRequest = { email, password };
      const authData = await authService.login(credentials);

      setState({
        user: {
          userId: authData.userId,
          email: authData.email,
          fullName: authData.fullName,
          role: authData.role,
          // Backward compatible aliases
          name: authData.fullName,
          phone: undefined,
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

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (
    fullName: string,
    email: string,
    password: string,
    phoneNumber?: string
  ): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const userData: RegisterRequest = {
        fullName,
        email,
        password,
        phoneNumber
      };
      const authData = await authService.register(userData);

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

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

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
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      clearError
    }}>
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
