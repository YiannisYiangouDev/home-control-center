"use client";

import { motion } from "framer-motion";
import { Mail, Send, Bell, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmailSettingsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 page-container max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Email Settings</h1>
        <p className="text-sm text-text-muted mt-1">Configure Resend API and notification preferences</p>
      </div>

      {/* Resend Config */}
      <div className="glass-card-static p-5">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text-secondary">Resend Configuration</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm text-text-secondary">API Key</label>
            <input type="password" placeholder="re_xxxxxxxxxxxx" className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-default text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-text-secondary">From Address</label>
            <input type="email" placeholder="alerts@yourdomain.com" className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-default text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm text-text-secondary">Report Recipient</label>
            <input type="email" placeholder="you@email.com" className="w-full px-4 py-2.5 rounded-lg bg-bg-elevated border border-border-default text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium shadow-lg shadow-primary-500/20">
              Save Configuration
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-elevated border border-border-default text-text-secondary text-sm hover:bg-bg-overlay transition-all">
              <Send className="w-4 h-4" /> Send Test Email
            </button>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="glass-card-static p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text-secondary">Notification Preferences</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: "Service down alerts", description: "Email when a service goes offline", defaultOn: true },
            { label: "Disk health warnings", description: "SMART errors and storage alerts", defaultOn: true },
            { label: "High temperature alerts", description: "CPU or disk temperature warnings", defaultOn: true },
            { label: "Login notifications", description: "Email on new login to this app", defaultOn: false },
            { label: "Daily system report", description: "Summary sent every morning at 8 AM", defaultOn: false },
            { label: "Weekly server report", description: "Detailed report every Monday at 9 AM", defaultOn: false },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between py-2 border-b border-border-subtle/50 last:border-0">
              <div>
                <p className="text-sm text-text-primary">{pref.label}</p>
                <p className="text-xs text-text-muted">{pref.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={pref.defaultOn} className="sr-only peer" />
                <div className="w-10 h-5 bg-bg-overlay rounded-full peer peer-checked:bg-primary-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 transition-colors"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Email Logs */}
      <div className="glass-card-static p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text-secondary">Recent Emails</h3>
        </div>
        <div className="space-y-2">
          {[
            { subject: "🚨 Sonarr Container Stopped", to: "admin@local", status: "sent", time: "2h ago" },
            { subject: "⚠️ Storage Array at 85%", to: "admin@local", status: "sent", time: "1h ago" },
            { subject: "📊 Daily System Report", to: "admin@local", status: "sent", time: "8h ago" },
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between py-2 text-sm border-b border-border-subtle/50 last:border-0">
              <div className="flex-1">
                <p className="text-text-primary text-xs">{log.subject}</p>
                <p className="text-[10px] text-text-muted">To: {log.to}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">{log.time}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-success-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
