"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SolarPanelField from "@/public/backgrounds/Vibrant Green Leaves Against Blue Sky.png";
import SolarPanelField2 from "@/public/backgrounds/Renewable Energy Solar Farm at Sunrise_Sunset.png";
import SolarPanelField3 from "@/public/backgrounds/Solar Panel Field.png";

const images = [SolarPanelField, SolarPanelField2, SolarPanelField3];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative text-white py-28 overflow-hidden">
      {/* Background Images with Carousel */}
      <div className="absolute inset-0 z-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image}
              alt={`Background ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover brightness-80 saturate-90"
            />
          </div>
        ))}
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/40 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-2xl mx-auto leading-tight">
          Solar Power for Your Future
        </h1>

        <p className="text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed text-white/90">
          High-quality solar panels for residential and commercial use. Sustainable
          energy solutions that save you money and protect the environment.
        </p>

        <Link href="/products">
          <Button
            size="lg"
            className="bg-white text-green-700 hover:bg-gray-100 px-8 py-6 text-lg shadow-xl"
          >
            Browse Products
          </Button>
        </Link>
      </div>
    </section>
  );
}

