import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  ACCESS_TOKEN_EXPIRY: string;
  REFRESH_TOKEN_EXPIRY: string;
  ALLOWED_ORIGINS: string;
  DATABASE_URL: string;
  DB_POOL_SIZE: number;
}

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key]?.trim();
  if (!value && fallback === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || fallback!;
}

export const ENV: EnvConfig = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVar('PORT', '5000')),
  JWT_ACCESS_SECRET: getEnvVar('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET'),
  ACCESS_TOKEN_EXPIRY: getEnvVar('ACCESS_TOKEN_EXPIRY', '15m'),
  REFRESH_TOKEN_EXPIRY: getEnvVar('REFRESH_TOKEN_EXPIRY', '7d'),
  ALLOWED_ORIGINS: getEnvVar('ALLOWED_ORIGINS'),
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  DB_POOL_SIZE: parseInt(getEnvVar('DB_POOL_SIZE', '10')),
};
