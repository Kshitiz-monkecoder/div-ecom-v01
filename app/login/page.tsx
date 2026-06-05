import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { LoginHero } from "@/components/login-hero";
import { LoginFooter } from "@/components/login-footer";
import { LoginPortalLabel } from "@/components/login-portal-label";
import { LanguageProvider } from "@/components/language-provider";

export default function LoginPage() {
  return (
    <LanguageProvider>
      <main className="relative min-h-svh overflow-hidden bg-primary">
        <Image
          src="/backgrounds/Renewable Energy Solar Farm at Sunrise_Sunset.png"
          alt="Solar farm at sunrise"
          fill
          className="object-cover opacity-55"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,6,23,0.92),rgba(15,23,42,0.74)_46%,rgba(232,113,10,0.35))]" />

        <div className="relative z-10 grid min-h-svh items-center gap-10 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:px-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 rounded-2xl customer-focus-ring">
              <Image
                src="/divy-power-logo.png"
                alt="Divy Power"
                width={148}
                height={52}
                className="h-12 w-auto rounded-xl bg-white/95 p-1"
                priority
              />
              <LoginPortalLabel />
            </Link>

            <LoginHero />
          </div>

          <aside className="w-full">
            <LoginForm />
            <LoginFooter />
          </aside>
        </div>
      </main>
    </LanguageProvider>
  );
}