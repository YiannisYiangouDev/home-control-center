"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  className?: string;
  onRefresh?: () => Promise<unknown>;
}

export function RefreshButton({ className, onRefresh }: RefreshButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      if (onRefresh) {
        await onRefresh().catch((err) => console.error("Refresh action failed:", err));
      }
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isPending}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-border-default bg-bg-surface text-text-secondary hover:text-text-primary transition-all disabled:opacity-50",
        isPending && "opacity-75",
        className
      )}
    >
      <RefreshCw className={cn("w-3.5 h-3.5", isPending && "animate-spin")} />
      {isPending ? "Refreshing..." : "Refresh"}
    </button>
  );
}
