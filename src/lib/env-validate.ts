const WEAK = [
  "your-",
  "change_me",
  "placeholder",
  "hcc_password",
  "root_password_change_me",
  "Admin123!",
];

/** Minimum acceptable length for raw secrets (base64/hex-encoded keys). */
const MIN_SECRET_LENGTH = 32;

export function validateSecrets(): void {
  // Skip validation during production builds: next build imports route/action
  // modules, and the build host may legitimately lack runtime secrets.
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  for (const [name, val] of Object.entries({
    AUTH_SECRET: process.env.AUTH_SECRET,
    WORKER_API_SECRET: process.env.WORKER_API_SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  })) {
    if (!val || val.length < MIN_SECRET_LENGTH || WEAK.some((w) => val.includes(w))) {
      throw new Error(
        `FATAL: ${name} is missing, weak, or a placeholder. ` +
          "Generate with: openssl rand -base64 32"
      );
    }
  }
}

export function assertNoBypassAuth(): void {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.BYPASS_AUTH === "true"
  ) {
    throw new Error("FATAL: BYPASS_AUTH must not be enabled in production.");
  }
}