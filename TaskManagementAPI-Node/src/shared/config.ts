// ============================================
// APPLICATION CONFIGURATION
// ============================================

export const config = {
  // ============================================
  // SERVER SETTINGS
  // ============================================
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // ============================================
  // DATABASE
  // ============================================
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement',

  // ============================================
  // JWT TOKEN CONFIGURATION
  // ============================================
  jwt: {
    // Secret keys for signing tokens
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-change-in-production',

    // ⏰ ACCESS TOKEN EXPIRY
    // Short-lived token sent in API response, stored in browser memory
    // Recommended: 15 minutes to 1 hour
    // Format: '3m', '5m', '15m', '30m', '1h', '2h'
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '3m',  // 👈 CHANGE HERE

    // ⏰ REFRESH TOKEN EXPIRY  
    // Long-lived token stored in HTTP-only cookie
    // Recommended: 1 day to 30 days (using 5m for testing)
    // Format: '5m', '1d', '7d', '14d', '30d'
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '5m',  // 👈 CHANGE HERE
  },

  // ============================================
  // COOKIE CONFIGURATION
  // ============================================
  cookie: {
    // ⏰ COOKIE MAX AGE (in milliseconds)
    // Should match or slightly exceed refresh token expiry
    // 5 minutes = 5 * 60 * 1000 = 300000 ms
    // 7 days = 7 * 24 * 60 * 60 * 1000 = 604800000 ms
    // 14 days = 14 * 24 * 60 * 60 * 1000 = 1209600000 ms
    maxAge: parseInt(process.env.COOKIE_MAX_AGE || '300000', 10),  // 👈 CHANGE HERE (ms) - 5 minutes
    
    // Cookie security settings
    httpOnly: true,       // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
    sameSite: (process.env.COOKIE_SAME_SITE || 'lax') as 'strict' | 'lax' | 'none',
    path: '/',            // Cookie sent with all requests
  },

  // ============================================
  // LOGGING & CORS
  // ============================================
  logLevel: process.env.LOG_LEVEL || 'debug',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4200',

  // ============================================
  // LEGACY PROPERTIES (for backward compatibility)
  // ============================================
  // @deprecated - Use config.jwt.secret instead
  get jwtSecret() { return this.jwt.secret; },
  // @deprecated - Use config.jwt.accessTokenExpiry instead
  get jwtExpiresIn() { return this.jwt.accessTokenExpiry; },
  // @deprecated - Use config.jwt.refreshSecret instead
  get jwtRefreshSecret() { return this.jwt.refreshSecret; },
  // @deprecated - Use config.jwt.refreshTokenExpiry instead
  get jwtRefreshExpiresIn() { return this.jwt.refreshTokenExpiry; },
  // @deprecated - Use config.cookie.secure instead
  get cookieSecure() { return this.cookie.secure; },
  // @deprecated - Use config.cookie.sameSite instead
  get cookieSameSite() { return this.cookie.sameSite; },
};

// Helper to convert expiry string to milliseconds (for reference)
export const expiryToMs: Record<string, number> = {
  '5m': 5 * 60 * 1000,             // 300,000 ms
  '15m': 15 * 60 * 1000,           // 900,000 ms
  '30m': 30 * 60 * 1000,           // 1,800,000 ms
  '1h': 60 * 60 * 1000,            // 3,600,000 ms
  '1d': 24 * 60 * 60 * 1000,       // 86,400,000 ms
  '7d': 7 * 24 * 60 * 60 * 1000,   // 604,800,000 ms
  '14d': 14 * 24 * 60 * 60 * 1000, // 1,209,600,000 ms
  '30d': 30 * 24 * 60 * 60 * 1000, // 2,592,000,000 ms
};

export const validateConfig = (): void => {
  const requiredVars: string[] = [];
  
  if (config.isProduction) {
    if (config.jwt.secret === 'your-super-secret-jwt-key-change-in-production') {
      requiredVars.push('JWT_SECRET must be set in production');
    }
    if (config.jwt.refreshSecret === 'your-refresh-token-secret-change-in-production') {
      requiredVars.push('JWT_REFRESH_SECRET must be set in production');
    }
  }
  
  if (requiredVars.length > 0) {
    throw new Error(`Configuration validation failed:\n${requiredVars.join('\n')}`);
  }
};
