const isDevelopment = process.env.NODE_ENV === "development";
const isVercelPreview = process.env.VERCEL_ENV === "preview";

export const isTestEnvironment = isDevelopment || isVercelPreview;

export const isSSR = typeof window === "undefined";
