import dotenv from "dotenv";
dotenv.config();

function optional(name: string, fallback = ""): string {
  const val = process.env[name];
  if (val === undefined || val === "") {
    // eslint-disable-next-line no-console
    console.warn(`[env] Missing environment variable: ${name}`);
    return fallback;
  }
  return val;
}

export const env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGO_URI: optional("MONGO_URI", "mongodb://localhost:27017/ashworth_club"),

  JWT_USER_SECRET: optional("JWT_USER_SECRET"),
  JWT_ADMIN_SECRET: optional("JWT_ADMIN_SECRET"),
  JWT_USER_EXPIRES_IN: process.env.JWT_USER_EXPIRES_IN || "24h",
  JWT_ADMIN_EXPIRES_IN: process.env.JWT_ADMIN_EXPIRES_IN || "24h",

  GMAIL_USER: process.env.GMAIL_USER || "",
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD || "",

  CASHFREE_APP_ID: process.env.CASHFREE_APP_ID || "",
  CASHFREE_SECRET_KEY: process.env.CASHFREE_SECRET_KEY || "",
  CASHFREE_ENV: process.env.CASHFREE_ENV || "TEST",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",

  OTP_EXPIRES_IN_SECONDS: parseInt(process.env.OTP_EXPIRES_IN_SECONDS || "300", 10),
  OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS || "5", 10),
  SIGNUP_SESSION_TTL_HOURS: parseInt(process.env.SIGNUP_SESSION_TTL_HOURS || "24", 10),

  CURRENT_CONSENT_VERSION: process.env.CURRENT_CONSENT_VERSION || "v1",

  // Comma-separated list of allowed frontend origins (user-site + admin-site,
  // and anything else — e.g. a staging URL) — see app.ts's cors() setup.
  // Falls back to "*" (reflects any origin) only when unset, so local dev
  // isn't blocked by default; set this explicitly for any real deployment.
  CORS_ORIGINS: (process.env.CORS_ORIGINS || "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
