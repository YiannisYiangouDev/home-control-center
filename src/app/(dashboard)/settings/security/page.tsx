"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Key,
  Users,
  Lock,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function SecuritySettingsPage() {
  const { data: session } = useSession();

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
              <span className="text-text-secondary">JWT (24h expiry)</span>
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
            <input type="password" className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-default text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-text-secondary">New Password</label>
            <input type="password" className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-default text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-text-secondary">Confirm New Password</label>
            <input type="password" className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-default text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
          </div>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium shadow-lg shadow-primary-500/20">
            Update Password
          </button>
        </div>
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
            { label: "Rate Limiting", status: true, detail: "5 req/min on auth, 60 req/min on API" },
            { label: "CSRF Protection", status: true, detail: "Double-submit cookie pattern" },
            { label: "Account Lockout", status: true, detail: "5 failed attempts → 15 min lockout" },
            { label: "Security Headers", status: true, detail: "HSTS, CSP, X-Frame-Options enabled" },
            { label: "Audit Logging", status: true, detail: "All auth events logged" },
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
