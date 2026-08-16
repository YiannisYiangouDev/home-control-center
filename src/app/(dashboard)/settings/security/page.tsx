"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Key,
  Users,
  Lock,
  AlertCircle,
  CheckCircle2,
  LogOut,
  QrCode,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { changePassword, setupTotp, verifyTotpSetup, disableTotp } from "@/actions/security";
import type { ActionResult } from "@/types";

function resultMsg(r: ActionResult): string {
  return r.success ? r.message || "Done" : r.error;
}

export default function SecuritySettingsPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMessage, setPwMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  // 2FA state
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [setupCode, setSetupCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [totpMessage, setTotpMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [totpBusy, setTotpBusy] = useState(false);

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      setPwMessage({ ok: false, text: "New passwords do not match" });
      return;
    }
    if (newPassword.length < 8) {
      setPwMessage({ ok: false, text: "Password must be at least 8 characters" });
      return;
    }
    setPwBusy(true);
    const result = await changePassword(currentPassword, newPassword);
    setPwMessage({ ok: result.success, text: resultMsg(result) });
    setPwBusy(false);
    if (result.success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  async function handleEnableTotp() {
    setTotpBusy(true);
    const result = await setupTotp();
    if (result.success && result.uri) {
      setTotpUri(result.uri);
      setTotpMessage({ ok: true, text: "Scan the QR code, then enter the 6-digit code to confirm." });
    } else {
      setTotpMessage({ ok: false, text: resultMsg(result) });
    }
    setTotpBusy(false);
  }

  async function handleConfirmTotp() {
    setTotpBusy(true);
    const result = await verifyTotpSetup(setupCode);
    setTotpMessage({ ok: result.success, text: resultMsg(result) });
    if (result.success) {
      setTotpUri(null);
      setSetupCode("");
    }
    setTotpBusy(false);
  }

  async function handleDisableTotp() {
    setTotpBusy(true);
    const result = await disableTotp(disableCode);
    setTotpMessage({ ok: result.success, text: resultMsg(result) });
    if (result.success) setDisableCode("");
    setTotpBusy(false);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 page-container max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Security</h1>
        <p className="text-sm text-text-muted mt-1">Authentication, sessions, and access control</p>
      </div>

      {/* Current Session */}
      <div className="glass-card-static p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text-secondary">Current Session</h3>
        </div>
        {session?.user && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm py-2 border-b border-border-subtle/50">
              <span className="text-text-muted">Email</span>
              <span className="text-text-primary">{session.user.email}</span>
            </div>
            <div className="flex items-center justify-between text-sm py-2 border-b border-border-subtle/50">
              <span className="text-text-muted">Role</span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary-500/10 text-primary-400">
                {(session.user as { role: string }).role}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm py-2">
              <span className="text-text-muted">Session Type</span>
              <span className="text-text-secondary">JWT (24h expiry, revocable)</span>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-danger-400/10 text-danger-400 border border-danger-400/20 text-sm hover:bg-danger-400/20 transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="glass-card-static p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text-secondary">Change Password</h3>
        </div>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="block text-sm text-text-secondary">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-default text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-text-secondary">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-default text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-text-secondary">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-default text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={pwBusy}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium shadow-lg shadow-primary-500/20 disabled:opacity-50"
          >
            {pwBusy ? "Updating..." : "Update Password"}
          </button>
          {pwMessage && (
            <p className={`text-sm flex items-center gap-1 ${pwMessage.ok ? "text-success-400" : "text-danger-400"}`}>
              {pwMessage.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {pwMessage.text}
            </p>
          )}
          <p className="text-xs text-text-muted">
            Changing your password signs out all other sessions immediately.
          </p>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="glass-card-static p-5">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text-secondary">Two-Factor Authentication</h3>
        </div>
        <p className="text-sm text-text-muted mb-4">
          {isAdmin
            ? "Add a TOTP authenticator app (Google Authenticator, Authy, 1Password) to require a 6-digit code at login."
            : "2FA is available for ADMIN accounts only."}
        </p>

        {!totpUri && isAdmin && (
          <button
            onClick={handleEnableTotp}
            disabled={totpBusy}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium shadow-lg shadow-primary-500/20 disabled:opacity-50"
          >
            {totpBusy ? "Working..." : "Enable 2FA"}
          </button>
        )}

        {totpUri && (
          <div className="space-y-3 max-w-md">
            <div className="p-4 rounded-lg bg-bg-elevated border border-border-default">
              <p className="text-xs text-text-muted mb-2">
                Scan with your authenticator app, or open manually in it:
              </p>
              <p className="text-xs font-mono text-primary-400 break-all">{totpUri}</p>
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="6-digit code"
              value={setupCode}
              onChange={(e) => setSetupCode(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-default text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
            <button
              onClick={handleConfirmTotp}
              disabled={totpBusy}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium shadow-lg shadow-primary-500/20 disabled:opacity-50"
            >
              Confirm & Enable
            </button>
          </div>
        )}

        {isAdmin && !totpUri && (
          <div className="space-y-3 max-w-md mt-4 pt-4 border-t border-border-subtle/50">
            <p className="text-xs text-text-muted">Already enabled? Disable with a current code:</p>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="6-digit code"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-default text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
              <button
                onClick={handleDisableTotp}
                disabled={totpBusy}
                className="px-4 py-2 rounded-lg bg-danger-400/10 text-danger-400 border border-danger-400/20 text-sm hover:bg-danger-400/20 transition-all disabled:opacity-50"
              >
                Disable
              </button>
            </div>
          </div>
        )}

        {totpMessage && (
          <p className={`text-sm mt-3 flex items-center gap-1 ${totpMessage.ok ? "text-success-400" : "text-danger-400"}`}>
            {totpMessage.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {totpMessage.text}
          </p>
        )}
      </div>

      {/* Security Status */}
      <div className="glass-card-static p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text-secondary">Security Status</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: "AES-256-GCM Encryption", status: true, detail: "All credentials encrypted at rest" },
            { label: "Rate Limiting", status: true, detail: "Per-IP limits on auth & API (proxy-aware)" },
            { label: "CSRF Protection", status: true, detail: "NextAuth double-submit cookie pattern" },
            { label: "Account Lockout", status: true, detail: "5 failed attempts → 15 min lockout + IP throttle" },
            { label: "Security Headers", status: true, detail: "HSTS, CSP, X-Frame-Options enabled" },
            { label: "Audit Logging", status: true, detail: "All auth events logged" },
            { label: "Session Revocation", status: true, detail: "Password change / 2FA change signs out other sessions" },
          ].map((check) => (
            <div key={check.label} className="flex items-center justify-between py-2 border-b border-border-subtle/50 last:border-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success-400" />
                <div>
                  <p className="text-sm text-text-primary">{check.label}</p>
                  <p className="text-[10px] text-text-muted">{check.detail}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-success-400/10 text-success-400">Active</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}