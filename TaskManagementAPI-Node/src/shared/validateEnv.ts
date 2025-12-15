import { logger } from './logger';

interface EnvConfig {
  required: string[];
  optional: string[];
}

const envConfig: EnvConfig = {
  required: [
    // These should be set in production
    // 'JWT_SECRET',
    // 'JWT_REFRESH_SECRET',
    // 'MONGODB_URI'
  ],
  optional: [
    'PORT',
    'NODE_ENV',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'JWT_ACCESS_TOKEN_EXPIRY',
    'JWT_REFRESH_TOKEN_EXPIRY',
    'COOKIE_MAX_AGE',
    'CORS_ORIGIN',
    'LOG_LEVEL'
  ]
};

/**
 * Validate environment variables on startup
 * @throws Error if required variables are missing in production
 */
export function validateEnv(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const missing: string[] = [];
  const warnings: string[] = [];

  // In production, enforce required variables
  if (isProduction) {
    // Check required variables
    const productionRequired = [
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'MONGODB_URI'
    ];

    for (const key of productionRequired) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }

    // Check for default/insecure values
    if (process.env.JWT_SECRET?.includes('change-in-production')) {
      missing.push('JWT_SECRET (must be changed from default)');
    }
    if (process.env.JWT_REFRESH_SECRET?.includes('change-in-production')) {
      missing.push('JWT_REFRESH_SECRET (must be changed from default)');
    }
  }

  // Log warnings for optional variables using defaults (development only)
  if (!isProduction) {
    for (const key of envConfig.optional) {
      if (!process.env[key]) {
        warnings.push(`${key} not set, using default value`);
      }
    }
  }

  // Log warnings in development
  if (warnings.length > 0 && !isProduction) {
    logger.warn('Environment warnings:', { warnings });
  }

  // Throw error if required variables are missing in production
  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error(message);
    throw new Error(message);
  }

  logger.info('Environment validation passed');
}

/**
 * Get environment variable with default value
 * @param key - Environment variable name
 * @param defaultValue - Default value if not set
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is not set and no default provided`);
  }
  return value ?? defaultValue!;
}

/**
 * Get environment variable as number
 * @param key - Environment variable name
 * @param defaultValue - Default value if not set
 */
export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    logger.warn(`Invalid number for ${key}, using default: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
}

/**
 * Get environment variable as boolean
 * @param key - Environment variable name
 * @param defaultValue - Default value if not set
 */
export function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key]?.toLowerCase();
  if (value === undefined) {
    return defaultValue;
  }
  return value === 'true' || value === '1' || value === 'yes';
}
