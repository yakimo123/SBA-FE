// Auth Request Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

// Auth Response Types
export interface AuthResponse {
    userId: number;
    email: string;
    fullName: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

// API Response wrapper
export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
    timestamp: string;
}

// User type for context
export interface AuthUser {
    userId: number;
    email: string;
    fullName: string;
    role: string;
    phoneNumber?: string;
    address?: string;
    rewardPoint?: number;
    // Backward compatible aliases
    name?: string; // alias for fullName
    phone?: string; // alias for phoneNumber
    points?: number; // alias for rewardPoint
}

// Auth State
export interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}
