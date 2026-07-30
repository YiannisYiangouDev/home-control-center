"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  children: React.ReactNode;
}

export function PullToRefresh({ children }: PullToRefreshProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const pullThreshold = 70; // px threshold to trigger refresh
  const maxPullDistance = 140; // max distance pulled visual boundary

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isRefreshing) return;
    
    const container = containerRef.current;
    if (!container) return;

    // Only allow pull-to-refresh if we are scrolled to the very top
    if (container.scrollTop === 0) {
      setStartY(e.touches[0].pageY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPulling || isRefreshing) return;

    const container = containerRef.current;
    if (!container) return;

    const currentY = e.touches[0].pageY;
    const deltaY = currentY - startY;

    // Only handle pull-down
    if (deltaY > 0 && container.scrollTop === 0) {
      // Apply friction (pull resistance)
      const resistance = 0.45;
      const calculatedPull = Math.min(deltaY * resistance, maxPullDistance);
      
      setPullDistance(calculatedPull);
      
      // Prevent default browser refresh/elastic scroll behavior
      if (e.cancelable) {
        e.preventDefault();
      }
    } else {
      // If user scrolls up, reset pulling status
      setIsPulling(false);
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling || isRefreshing) return;
    
    setIsPulling(false);

    if (pullDistance >= pullThreshold) {
      triggerRefresh();
    } else {
      setPullDistance(0);
    }
  };

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    setPullDistance(pullThreshold); // Hold pull indicator visible

    try {
      // Trigger Next.js server data revalidation
      await new Promise<void>((resolve) => {
        router.refresh();
        // Artificial timeout to ensure a natural transition and visual feedback
        setTimeout(resolve, 800);
      });
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="flex-1 overflow-y-auto overscroll-y-contain relative h-full scroll-smooth"
    >
      {/* Pull-to-refresh Indicator */}
      <div
        className="flex items-center justify-center bg-bg-deep/40 border-b border-border-subtle/30 overflow-hidden transition-all duration-200 ease-out"
        style={{ 
          height: `${pullDistance}px`,
          opacity: pullDistance > 10 ? 1 : 0
        }}
      >
        <div className="flex items-center gap-2 text-xs font-medium text-text-muted py-2">
          {isRefreshing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-primary-400" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <ArrowDown 
                className={cn(
                  "w-4 h-4 text-text-muted transition-transform duration-200",
                  pullDistance >= pullThreshold ? "rotate-180 text-primary-400" : ""
                )} 
              />
              <span>
                {pullDistance >= pullThreshold 
                  ? "Release to update" 
                  : "Pull down to update"
                }
              </span>
            </>
          )}
        </div>
      </div>
      
      {/* Content Container */}
      <div 
        className="transition-transform duration-200 ease-out"
        style={{
          transform: !isRefreshing && pullDistance > 0 ? `translateY(${pullDistance * 0.25}px)` : "none"
        }}
      >
        {children}
      </div>
    </div>
  );
}
