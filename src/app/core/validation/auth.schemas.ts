import { z } from 'zod';
import { Role } from '../models/user.model';

// ---------------------------------------------------------------------------
// Primitive field schemas (mirroring backend TypeBox constraints)
// ---------------------------------------------------------------------------

export const emailSchema = z
  .string()
  .trim()
  .email('Please enter a valid email address.');

export const plainPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be at most 72 characters.');

export const namePartSchema = z
  .string()
  .trim()
  .min(1, 'Name is required.')
  .max(64, 'Name must be at most 64 characters.');

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export const loginBodySchema = z.object({
  email: emailSchema,
  password: plainPasswordSchema,
});

export type LoginBody = z.infer<typeof loginBodySchema>;

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export const registerBodySchema = z.object({
  firstName: namePartSchema,
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required.')
    .max(64, 'Last name must be at most 64 characters.'),
  email: emailSchema,
  password: plainPasswordSchema,
});

export type RegisterBody = z.infer<typeof registerBodySchema>;

// ---------------------------------------------------------------------------
// Auth API responses (runtime parse to catch malformed server payloads)
// ---------------------------------------------------------------------------

export const authTokensOnlySchema = z.object({
  accessToken: z.string().min(1, 'Missing access token in response.'),
  refreshToken: z.string().min(1, 'Missing refresh token in response.'),
});

export type AuthTokensOnlyParsed = z.infer<typeof authTokensOnlySchema>;

export const authTokensWithUserSchema = authTokensOnlySchema.extend({
  user: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    role: z.nativeEnum(Role),
    createdAt: z.string(),
    active: z.boolean().optional(),
  }),
});

export type AuthTokensWithUserParsed = z.infer<typeof authTokensWithUserSchema>;

// ---------------------------------------------------------------------------
// Verify email
// ---------------------------------------------------------------------------

export const verifyEmailCodeSchema = z
  .string()
  .regex(/^[0-9]{6}$/, 'Please enter the 6-digit code sent to your email.');

export const verifyEmailBodySchema = z.object({
  email: emailSchema,
  code: verifyEmailCodeSchema,
});

export type VerifyEmailBody = z.infer<typeof verifyEmailBodySchema>;

export const verifyEmailResponseDataSchema = z.object({
  verified: z.literal(true),
});

export type VerifyEmailResponseData = z.infer<typeof verifyEmailResponseDataSchema>;

// ---------------------------------------------------------------------------
// Resend verification
// ---------------------------------------------------------------------------

export const resendVerificationBodySchema = z.object({
  email: emailSchema,
});

export type ResendVerificationBody = z.infer<typeof resendVerificationBodySchema>;

export const resendVerificationResponseDataSchema = z.object({
  message: z.string().min(1),
});

export type ResendVerificationResponseData = z.infer<typeof resendVerificationResponseDataSchema>;
