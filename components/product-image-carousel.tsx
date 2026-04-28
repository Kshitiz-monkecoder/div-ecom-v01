"use client";

import { useState, useEffect } from "react";
import { SafeImage } from "@/components/safe-image";

interface ProductImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ProductImageCarousel({ images, alt, className = "" }: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Only auto-rotate if there are multiple images
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    if (!hasMultipleImages || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3500); // Change image every 3.5 seconds

    return () => clearInterval(interval);
  }, [images.length, hasMultipleImages, isHovered]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        No image available
      </div>
    );
  }

  if (!hasMultipleImages) {
    return (
      <SafeImage
        src={images[0]}
        alt={alt}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <SafeImage
            src={image}
            alt={`${alt} - Image ${index + 1}`}
            className={`h-full w-full object-cover ${className}`}
          />
        </div>
      ))}
    </div>
  );
}

