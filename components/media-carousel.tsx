"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
      <div className={`w-full h-56 rounded-lg border flex items-center justify-center text-sm text-muted-foreground ${className}`}>
        No media available yet.
      </div>
    );
  }

  const displayIndex = Math.min(currentIndex, Math.max(0, safeItems.length - 1));
  const currentItem = safeItems[displayIndex];

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
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
          <Image
            src={currentItem.url}
            alt={currentItem.alt || "Carousel image"}
            fill
            className="object-cover"
          />
        )}
      </div>

      {hasMultiple && (
        <>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80"
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
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80"
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
