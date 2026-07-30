"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Zap, Plus, Phone, MessageSquare, Mail, Globe, Shield,
  Heart, Briefcase, AlertTriangle, ExternalLink, Pencil, Trash2, X, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateShortcut, deleteShortcut, createShortcut } from "@/actions/shortcuts";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Phone, MessageSquare, Mail, Globe, Shield, Heart, Briefcase, AlertTriangle, Zap, ExternalLink,
};

interface Shortcut {
  id: string;
  title: string;
  action: string;
  actionType: string;
  icon: string;
  color: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface ShortcutsClientProps {
  shortcuts: readonly any[];
  categories: readonly any[];
}

const seedCategories: Category[] = [
  { id: "family", name: "Family", icon: "Heart", color: "#f472b6" },
  { id: "work", name: "Work", icon: "Briefcase", color: "#60a5fa" },
  { id: "emergency", name: "Emergency", icon: "AlertTriangle", color: "#f87171" },
  { id: "services", name: "Services", icon: "Globe", color: "#34d399" },
];

export function ShortcutsClient({ shortcuts, categories }: ShortcutsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const cats: Category[] = categories.length > 0 ? categories.map((c: any) => ({
    id: c.id,
    name: c.name,
    icon: c.icon || "Globe",
    color: c.color || "#00b4d8",
  })) : seedCategories;

  const [items, setItems] = useState<Shortcut[]>(() => {
    if (shortcuts.length > 0) {
      return shortcuts.map((s: any): Shortcut => ({
        id: s.id,
        title: s.title,
        action: s.action,
        actionType: s.actionType || "URL",
        icon: s.icon || "Globe",
        color: s.color || "#00b4d8",
        category: s.category?.id || s.categoryId || "services",
      }));
    }
    return [
      { id: "s1", title: "Call Mum", action: "tel:+", actionType: "PHONE_CALL", icon: "Phone", color: "#f472b6", category: "family" },
      { id: "s2", title: "Call Dad", action: "tel:+", actionType: "PHONE_CALL", icon: "Phone", color: "#34d399", category: "family" },
      { id: "s3", title: "SMS ss", action: "sms:+35799823800&body=good morninggg", actionType: "SMS", icon: "MessageSquare", color: "#34d399", category: "family" },
      { id: "s6", title: "Insta", action: "https://www.instagram.com/direct/inbox/", actionType: "URL", icon: "MessageSquare", color: "#E4405F", category: "family" },
      { id: "s7", title: "WireGuard", action: "http://192.168.0.200:8900/Settings/VPNManager", actionType: "URL", icon: "Shield", color: "#8b5cf6", category: "services" },
      { id: "s8", title: "Vault", action: "https://vault.local", actionType: "URL", icon: "Shield", color: "#175ddc", category: "services" },
      { id: "s9", title: "❄️ AC", action: "http://192.168.0.200:8888", actionType: "URL", icon: "Zap", color: "#00b4d8", category: "services" },
      { id: "s4", title: "Nextcloud", action: "https://arxeia.yiangouweb.com", actionType: "URL", icon: "Globe", color: "#0082c9", category: "services" },
      { id: "s5", title: "Unraid", action: "http://192.168.0.200:8900/Dashboard", actionType: "URL", icon: "Zap", color: "#f59e0b", category: "services" },
    ];
  });

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", action: "", icon: "Globe", color: "#00b4d8" });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState({ title: "", action: "", icon: "Globe", color: "#00b4d8", category: "family", actionType: "URL" });

  const filtered = activeCategory
    ? items.filter((s) => s.category === activeCategory)
    : items;

  const handleEdit = (s: Shortcut) => {
    setEditingId(s.id);
    setEditForm({ title: s.title, action: s.action, icon: s.icon, color: s.color });
  };

  const handleSave = () => {
    if (!editingId) return;
    startTransition(async () => {
      await updateShortcut(editingId, editForm);
      setEditingId(null);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    startTransition(async () => {
      await deleteShortcut(confirmDelete);
      setConfirmDelete(null);
      router.refresh();
    });
  };

  const handleAdd = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("title", newForm.title);
      fd.set("action", newForm.action);
      fd.set("actionType", newForm.actionType);
      fd.set("icon", newForm.icon);
      fd.set("color", newForm.color);
      // categoryId is optional — leave empty for now
      await createShortcut(fd);
      setShowAdd(false);
      setNewForm({ title: "", action: "", icon: "Globe", color: "#00b4d8", category: "family", actionType: "URL" });
      router.refresh();
    });
  };

  return (
    <div className="space-y-6 page-container">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Shortcuts</h1>
          <p className="text-sm text-text-muted mt-1">Quick actions and deep links</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium shadow-lg shadow-primary-500/20 hover:from-primary-500 hover:to-primary-400 transition-all">
          <Plus className="w-4 h-4" /> Add Shortcut
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn("px-4 py-2 rounded-lg text-xs font-medium transition-all shrink-0 border",
            !activeCategory ? "bg-primary-500/10 text-primary-400 border-primary-500/20" : "bg-bg-surface text-text-muted border-border-default hover:text-text-secondary"
          )}
        >All</button>
        {cats.map((cat) => {
          const Icon = iconMap[cat.icon] || Globe;
          return (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all shrink-0 border",
                activeCategory === cat.id ? "bg-primary-500/10 text-primary-400 border-primary-500/20" : "bg-bg-surface text-text-muted border-border-default hover:text-text-secondary"
              )}
            ><Icon className="w-3.5 h-3.5" />{cat.name}</button>
          );
        })}
      </div>

      {/* Shortcut Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {filtered.map((shortcut) => {
          const Icon = iconMap[shortcut.icon] || Globe;
          const isEditing = editingId === shortcut.id;

          if (isEditing) {
            return (
              <div key={shortcut.id} className="flex flex-col gap-2 p-4 rounded-xl bg-bg-elevated border-2 border-primary-500/30">
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Title"
                  className="w-full px-2 py-1 text-xs rounded bg-bg-surface border border-border-default text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <input
                  value={editForm.action}
                  onChange={(e) => setEditForm({ ...editForm, action: e.target.value })}
                  placeholder="URL or tel:"
                  className="w-full px-2 py-1 text-xs rounded bg-bg-surface border border-border-default text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono"
                />
                <div className="flex gap-1">
                  <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium bg-primary-500 text-white"><Check className="w-3 h-3" />Save</button>
                  <button onClick={() => setEditingId(null)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded text-xs font-medium bg-bg-overlay text-text-muted"><X className="w-3 h-3" />Cancel</button>
                </div>
              </div>
            );
          }

          return (
            <div key={shortcut.id} className="relative group">
              <motion.a
                href={shortcut.action}
                target={shortcut.actionType === "URL" ? "_blank" : undefined}
                rel={shortcut.actionType === "URL" ? "noopener noreferrer" : undefined}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-bg-elevated/50 border border-border-subtle hover:border-border-default transition-all cursor-pointer block"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ backgroundColor: `${shortcut.color}15`, color: shortcut.color }}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-text-secondary text-center truncate w-full">{shortcut.title}</span>
              </motion.a>

              {/* Edit/Delete buttons on hover */}
              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.preventDefault(); handleEdit(shortcut); }}
                  className="p-1 rounded bg-bg-surface border border-border-default text-text-muted hover:text-primary-400"
                ><Pencil className="w-3 h-3" /></button>
                <button onClick={(e) => { e.preventDefault(); setConfirmDelete(shortcut.id); }}
                  className="p-1 rounded bg-bg-surface border border-border-default text-text-muted hover:text-danger-400"
                ><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Shortcut Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="glass-card p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Add Shortcut</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded text-text-muted hover:text-text-secondary"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={newForm.title} onChange={(e) => setNewForm({ ...newForm, title: e.target.value })} placeholder="Name" className="w-full px-3 py-2 text-sm rounded-lg bg-bg-surface border border-border-default text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
              <input value={newForm.action} onChange={(e) => setNewForm({ ...newForm, action: e.target.value })} placeholder="URL, tel:+, sms:+" className="w-full px-3 py-2 text-sm rounded-lg bg-bg-surface border border-border-default text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/50 font-mono" />
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={isPending || !newForm.title || !newForm.action} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium disabled:opacity-50">
                  {isPending ? "Adding..." : "Add"}
                </button>
                <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-lg bg-bg-elevated border border-border-default text-text-secondary text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="glass-card p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Shortcut?</h3>
            <p className="text-sm text-text-muted mb-4">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="flex-1 py-2 rounded-lg bg-danger-500 text-white text-sm font-medium">Delete</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 rounded-lg bg-bg-elevated border border-border-default text-text-secondary text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
