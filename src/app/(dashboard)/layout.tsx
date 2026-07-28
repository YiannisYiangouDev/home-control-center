"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Server,
  Cloud,
  Activity,
  Zap,
  Bell,
  Settings,
  ChevronLeft,
  ChevronDown,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { NAV_ITEMS, MOBILE_NAV_ITEMS, APP_NAME } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Server,
  Cloud,
  Activity,
  Zap,
  Bell,
  Settings,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-deep">
      {/* ============ Desktop Sidebar ============ */}
      <aside
        className={`hidden lg:flex flex-col border-r border-border-subtle bg-bg-base transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-border-subtle shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-semibold text-sm text-text-primary truncate"
            >
              {APP_NAME}
            </motion.span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon] || Activity;
            const active = isActive(item.href);
            const hasChildren = "children" in item && item.children;
            const expanded = expandedItems.includes(item.title);

            return (
              <div key={item.title}>
                <Link
                  href={hasChildren ? "#" : item.href}
                  onClick={(e) => {
                    if (hasChildren) {
                      e.preventDefault();
                      toggleExpand(item.title);
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    active
                      ? "bg-primary-500/10 text-primary-400 border border-primary-500/20"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-surface border border-transparent"
                  }`}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      active
                        ? "text-primary-400"
                        : "text-text-muted group-hover:text-text-secondary"
                    }`}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.title}</span>
                      {hasChildren && (
                        <ChevronDown
                          className={`w-4 h-4 text-text-muted transition-transform ${
                            expanded ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </>
                  )}
                </Link>

                {/* Sub-items */}
                {hasChildren && expanded && !collapsed && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-8 mt-1 space-y-0.5 overflow-hidden"
                    >
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-3 py-2 rounded-md text-sm transition-all ${
                            pathname === child.href
                              ? "text-primary-400 bg-primary-500/5"
                              : "text-text-muted hover:text-text-secondary hover:bg-bg-surface"
                          }`}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </nav>

        {/* Collapse Button + User */}
        <div className="p-3 border-t border-border-subtle space-y-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-bg-surface transition-all text-sm"
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform ${
                collapsed ? "rotate-180" : ""
              }`}
            />
            {!collapsed && <span>Collapse</span>}
          </button>

          {session?.user && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary-400" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {session.user.name || "Admin"}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {session.user.email}
                  </p>
                </div>
              )}
              {!collapsed && (
                <button
                  onClick={() => signOut()}
                  className="text-text-muted hover:text-danger-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ============ Mobile Sidebar Overlay ============ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 bg-bg-base border-r border-border-subtle z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 h-16 border-b border-border-subtle">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <Server className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-sm text-text-primary">
                    {APP_NAME}
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-text-muted hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = iconMap[item.icon] || Activity;
                  const active = isActive(item.href);
                  const hasChildren = "children" in item && item.children;

                  return (
                    <div key={item.title}>
                      <Link
                        href={hasChildren ? item.children![0].href : item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          active
                            ? "bg-primary-500/10 text-primary-400"
                            : "text-text-secondary hover:text-text-primary hover:bg-bg-surface"
                        }`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                      {hasChildren && active && (
                        <div className="ml-8 mt-1 space-y-0.5">
                          {item.children!.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className={`block px-3 py-2 rounded-md text-sm ${
                                pathname === child.href
                                  ? "text-primary-400"
                                  : "text-text-muted hover:text-text-secondary"
                              }`}
                            >
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ============ Main Content ============ */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-border-subtle bg-bg-base/80 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-text-muted hover:text-text-primary"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-text-primary capitalize">
              {pathname.split("/").filter(Boolean).pop() || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/alerts"
              className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-400 rounded-full" />
            </Link>

            {session?.user && (
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border-subtle">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-400" />
                </div>
                <span className="text-sm text-text-secondary">
                  {session.user.name || session.user.email}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">{children}</div>
        </div>

        {/* ============ Mobile Bottom Nav ============ */}
        <nav className="lg:hidden border-t border-border-subtle bg-bg-base/95 backdrop-blur-sm flex items-center justify-around px-2 py-1 safe-area-bottom shrink-0">
          {MOBILE_NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon] || Activity;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all ${
                  active
                    ? "text-primary-400"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
