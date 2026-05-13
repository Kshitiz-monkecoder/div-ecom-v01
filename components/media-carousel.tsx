"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SafeImage } from "@/components/safe-image";

export type MediaItem = {
  type: "image" | "video";
  url: string;
  alt?: string;
};

interface MediaCarouselProps {
  items: MediaItem[];
  className?: string;
}

export function MediaCarousel({ items, className = "" }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeItems = useMemo(() => items.filter((item) => item.url), [items]);
  const hasMultiple = safeItems.length > 1;

  useEffect(() => {
    if (safeItems.length === 0) return;
    const timer = setTimeout(() => {
      setCurrentIndex((i) => (i >= safeItems.length ? 0 : i));
    }, 0);
    return () => clearTimeout(timer);
  }, [safeItems.length]);

  if (!safeItems || safeItems.length === 0) {
    return (
      <div className={`flex h-56 w-full items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-slate-50 text-sm text-slate-500 ${className}`}>
        No media available yet.
      </div>
    );
  }

  const displayIndex = Math.min(currentIndex, Math.max(0, safeItems.length - 1));
  const currentItem = safeItems[displayIndex];

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/80 bg-slate-100">
        {currentItem.type === "video" ? (
          <video
            src={currentItem.url}
            className="h-full w-full object-cover"
            controls
            autoPlay
            muted
            playsInline
            loop
          />
        ) : (
          <SafeImage
            src={currentItem.url}
            alt={currentItem.alt || "Carousel image"}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {hasMultiple && (
        <>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border-white/80 bg-white/90 shadow-lg"
            onClick={() =>
              setCurrentIndex((prev) => (prev - 1 + safeItems.length) % safeItems.length)
            }
            aria-label="Previous media"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border-white/80 bg-white/90 shadow-lg"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % safeItems.length)}
            aria-label="Next media"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
