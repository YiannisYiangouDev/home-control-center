import { timingSafeEqual } from "crypto";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function formatTemperature(celsius: number): string {
  return `${Math.round(celsius)}°C`;
}

export function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case "ONLINE":
    case "HEALTHY":
    case "OK":
      return "text-success-400";
    case "OFFLINE":
    case "ERROR":
    case "CRITICAL":
      return "text-danger-400";
    case "WARNING":
    case "DEGRADED":
      return "text-warning-400";
    default:
      return "text-text-muted";
  }
}

export function getStatusDotClass(status: string): string {
  switch (status.toUpperCase()) {
    case "ONLINE":
    case "HEALTHY":
    case "OK":
      return "status-dot status-dot-online";
    case "OFFLINE":
    case "ERROR":
    case "CRITICAL":
      return "status-dot status-dot-offline";
    case "WARNING":
    case "DEGRADED":
      return "status-dot status-dot-warning";
    default:
      return "status-dot";
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity.toUpperCase()) {
    case "CRITICAL":
      return "text-danger-400 bg-danger-400/10 border-danger-400/20";
    case "WARNING":
      return "text-warning-400 bg-warning-400/10 border-warning-400/20";
    case "INFO":
      return "text-primary-400 bg-primary-400/10 border-primary-400/20";
    default:
      return "text-text-muted bg-bg-overlay border-border-default";
  }
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return then.toLocaleDateString();
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
