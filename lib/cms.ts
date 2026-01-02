export const env = {
  CMS_API_KEY: process.env.CMS_API_KEY || '',
} as const;

export type Config = typeof env;
