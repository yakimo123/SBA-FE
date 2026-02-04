import api, { setTokens, clearTokens, getRefreshToken } from './api';
import {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    TokenResponse,
    ApiResponse
} from '../types/auth';

const AUTH_ENDPOINTS = {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    REFRESH: '/api/v1/auth/refresh',
};

export const authService = {
    /**
     * Login user with email and password
     */
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>(
            AUTH_ENDPOINTS.LOGIN,
            credentials
        );

        const authData = response.data.data;

        // Save tokens to localStorage
        setTokens(authData.accessToken, authData.refreshToken);

        return authData;
    },

    /**
     * Register new user
     */
    async register(userData: RegisterRequest): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>(
            AUTH_ENDPOINTS.REGISTER,
            userData
        );

        const authData = response.data.data;

        // Save tokens to localStorage
        setTokens(authData.accessToken, authData.refreshToken);

        return authData;
    },

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(): Promise<TokenResponse> {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await api.post<ApiResponse<TokenResponse>>(
            AUTH_ENDPOINTS.REFRESH,
            { refreshToken }
        );

        const tokenData = response.data.data;

        // Update tokens in localStorage
        setTokens(tokenData.accessToken, tokenData.refreshToken);

        return tokenData;
    },

    /**
     * Logout user - clear tokens
     */
    logout(): void {
        clearTokens();
    },

    /**
     * Check if user is authenticated (has access token)
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('accessToken');
    },
};

export default authService;
