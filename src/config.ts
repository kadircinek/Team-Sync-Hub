import dotenv from 'dotenv';

dotenv.config();

export const config = {
  googleApi: {
    apiKey: process.env.GOOGLE_API_KEY || '',
    model: 'gemini-2.0-flash',
  },
  app: {
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
};

export function validateConfig(): boolean {
  if (!config.googleApi.apiKey) {
    console.error('Missing GOOGLE_API_KEY in environment variables');
    return false;
  }
  return true;
}
