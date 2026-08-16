import { authenticator } from "otplib";

// TOTP codes are valid for 30s windows; allow 1 step of clock drift each way.
authenticator.options = { window: 1 };

export const totp = authenticator;

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function generateTotpUri(
  account: string,
  secret: string,
  issuer = "Home Control Center"
): string {
  return authenticator.keyuri(account, issuer, secret);
}