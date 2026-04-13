import crypto from "node:crypto";

interface OtpEntry {
  otp: string;
  name?: string;
  role?: string;
  expiresAt: number;
  attempts: number;
}

const store = new Map<string, OtpEntry>();

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function generateOtp(): string {
  return String(crypto.randomInt(100_000, 1_000_000));
}

export function setOtp(
  email: string,
  otp: string,
  name?: string,
  role?: string
): void {
  store.set(email.toLowerCase(), {
    otp,
    name,
    role,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
}

export interface OtpVerifyResult {
  valid: boolean;
  entry?: OtpEntry;
  reason?: string;
}

export function verifyOtp(email: string, otp: string): OtpVerifyResult {
  const key = email.toLowerCase();
  const entry = store.get(key);

  if (!entry) {
    return { valid: false, reason: "OTP not found or expired. Please request a new one." };
  }
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return { valid: false, reason: "OTP has expired. Please request a new one." };
  }
  entry.attempts += 1;
  if (entry.attempts > MAX_ATTEMPTS) {
    store.delete(key);
    return { valid: false, reason: "Too many failed attempts. Please request a new OTP." };
  }
  if (entry.otp !== otp) {
    return {
      valid: false,
      reason: `Incorrect OTP. ${MAX_ATTEMPTS - entry.attempts} attempt(s) remaining.`,
    };
  }
  store.delete(key);
  return { valid: true, entry };
}
