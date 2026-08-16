import { lookup } from "node:dns/promises";

// RFC1918, loopback, link-local, metadata, unspecified, and IPv6 private ranges.
const BLOCKED =
  /^(10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|0\.|::1$|fc|fd|fe80)/;

// Explicitly allowed internal hosts (comma-separated hostnames or IPs).
// This app is a LAN monitor: it must be able to poll Unraid / Nextcloud /
// Home Assistant etc. Only the listed hosts are exempt; loopback, link-local
// and cloud-metadata remain blocked.
const ALLOWED_INTERNAL = (process.env.ALLOWED_INTERNAL_HOSTS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export async function isInternalHost(hostname: string): Promise<boolean> {
  if (ALLOWED_INTERNAL.includes(hostname)) return false; // explicit allow
  if (BLOCKED.test(hostname)) return true;
  try {
    const addrs = await lookup(hostname, { all: true });
    return addrs.some((a) => BLOCKED.test(a.address));
  } catch {
    return true; // fail closed on DNS errors
  }
}

export async function safeFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const u = new URL(url);
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error(`Blocked: non-http(s) URL ${u.protocol}`);
  }
  if (await isInternalHost(u.hostname)) {
    throw new Error(`Blocked: internal host ${u.hostname}`);
  }
  // Do not follow redirects: a public URL may 302 to an internal host.
  return fetch(url, { ...init, redirect: "manual" });
}