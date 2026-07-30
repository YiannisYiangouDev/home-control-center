import { Suspense } from "react";
import { getShortcuts, getShortcutCategories } from "@/actions/shortcuts";
import { ShortcutsClient } from "../../../components/dashboard/ShortcutsClient";

export const revalidate = 30;

const seed = [
  { id: "s1", title: "Call Mum", action: "tel:+", actionType: "PHONE_CALL", icon: "Phone", color: "#f472b6", category: "family" },
  { id: "s2", title: "Call Dad", action: "tel:+", actionType: "PHONE_CALL", icon: "Phone", color: "#34d399", category: "family" },
  { id: "s3", title: "SMS ss", action: "sms:+35799823800&body=good morninggg", actionType: "SMS", icon: "MessageSquare", color: "#34d399", category: "family" },
  { id: "s6", title: "Insta", action: "https://www.instagram.com/direct/inbox/", actionType: "URL", icon: "MessageSquare", color: "#E4405F", category: "family" },
  { id: "s4", title: "Nextcloud", action: "https://arxeia.yiangouweb.com", actionType: "URL", icon: "Globe", color: "#0082c9", category: "services" },
  { id: "s7", title: "WireGuard", action: "http://192.168.0.200:8900/Settings/VPNManager", actionType: "URL", icon: "Shield", color: "#8b5cf6", category: "services" },
  { id: "s8", title: "Vault", action: "https://vault.local", actionType: "URL", icon: "Shield", color: "#175ddc", category: "services" },
  { id: "s9", title: "❄️ AC", action: "http://192.168.0.200:8888", actionType: "URL", icon: "Zap", color: "#00b4d8", category: "services" },
  { id: "s5", title: "Unraid", action: "http://192.168.0.200:8900/Dashboard", actionType: "URL", icon: "Zap", color: "#f59e0b", category: "services" },
];

const seedCats = [
  { id: "family", name: "Family", icon: "Heart", color: "#f472b6" },
  { id: "work", name: "Work", icon: "Briefcase", color: "#60a5fa" },
  { id: "services", name: "Services", icon: "Globe", color: "#34d399" },
];

export default async function ShortcutsPage() {
  let shortcuts: any[] = [];
  let cats: any[] = [];
  try { shortcuts = await getShortcuts(); } catch { /* empty */ }
  try { cats = await getShortcutCategories(); } catch { /* empty */ }

  return (
    <Suspense fallback={<div className="animate-pulse h-96" />}>
      <ShortcutsClient
        shortcuts={shortcuts.length > 0 ? shortcuts : seed}
        categories={cats.length > 0 ? cats : seedCats}
      />
    </Suspense>
  );
}
