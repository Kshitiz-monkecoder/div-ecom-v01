"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getTranslation, interpolate, type Locale } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "app-locale";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  localeReady: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [localeReady, setLocaleReady] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === "en" || stored === "hi") {
      setLocaleState(stored);
      setShowPopup(false);
    } else {
      setShowPopup(true);
    }
    setLocaleReady(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    }
    setShowPopup(false);
  }, []);

  useEffect(() => {
    if (localeReady) {
      document.documentElement.lang = locale;
    }
  }, [locale, localeReady]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const raw = getTranslation(locale, key);
      return vars ? interpolate(raw, vars) : raw;
    },
    [locale]
  );

  const handleEnglish = () => setLocale("en");
  const handleHindi = () => setLocale("hi");

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, localeReady }}>
      {children}
      <Dialog open={showPopup && localeReady}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {locale === "hi" ? "भाषा चुनें / Choose language" : "Choose language / भाषा चुनें"}
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={handleEnglish} variant="outline" className="min-h-[48px] min-w-[140px]">
              Continue in English
            </Button>
            <Button onClick={handleHindi} className="min-h-[48px] min-w-[140px] bg-primary">
              हिंदी में जारी रखें
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LanguageContext.Provider>
  );
}
