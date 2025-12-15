/**
 * Data Transfer Objects for Authentication
 * Separates API contract from internal entities
 */

// ============================================
// REQUEST DTOs
// ============================================

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface RegisterRequestDto {
  username: string;
  password: string;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface LoginResponseDto {
  success: boolean;
  message?: string;
  token: string;
  username: string;
}

export interface RegisterResponseDto {
  success: boolean;
  message: string;
}

export interface RefreshResponseDto {
  success: boolean;
  token: string;
}

export interface LogoutResponseDto {
  success: boolean;
  message: string;
}
