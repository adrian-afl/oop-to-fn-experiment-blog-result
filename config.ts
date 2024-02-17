import { z } from "zod";

export const availableLogLevels: readonly string[] = [
  "none",
  "error",
  "warn",
  "info",
  "verbose",
  "debug",
] as const;

const schema = z
  .object({
    LOG_LEVEL: z.enum(availableLogLevels as [string, ...string[]]),
    JWT_SECRET: z.string().min(64),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().min(1),
    SMTP_SECURE: z
      .enum(["true", "false"])
      .transform((value) => value === "true"),
    SMTP_USER: z.string().min(1),
    SMTP_PASS: z.string().min(1),
    FRONTEND_APP_URL: z.string().url(),
    DATABASE_URL: z.string().min(1),
    API_PORT: z.coerce.number().min(1).max(65535),
  })
  .transform((data) => ({
    logLevel: data.LOG_LEVEL,
    apiPort: data.API_PORT,

    auth: {
      jwtSecret: data.JWT_SECRET,
    },

    smtp: {
      host: data.SMTP_HOST,
      port: data.SMTP_PORT,
      secure: data.SMTP_SECURE,
      user: data.SMTP_USER,
      password: data.SMTP_PASS,
    },

    frontend: {
      url: data.FRONTEND_APP_URL,
    },
  }));

export const config = schema.parse(process.env);
