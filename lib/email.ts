export const env = {
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
} as const;

export type Config = typeof env;
