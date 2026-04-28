"use client";

import { useEffect, useMemo, useState } from "react";

const FALLBACK_SRC = "/image-fallback.svg";

type SafeImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

const isRenderableImageUrl = (value?: string | null): value is string => {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export function SafeImage({ src, alt, className = "" }: SafeImageProps) {
  const initialSrc = useMemo(
    () => (isRenderableImageUrl(src) ? src.trim() : FALLBACK_SRC),
    [src]
  );
  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  useEffect(() => {
    setCurrentSrc(initialSrc);
  }, [initialSrc]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (currentSrc !== FALLBACK_SRC) {
          setCurrentSrc(FALLBACK_SRC);
        }
      }}
    />
  );
}
