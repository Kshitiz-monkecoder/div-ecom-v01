import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2, ShieldCheck, SunMedium, Zap } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
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
        <section className="max-w-4xl text-white">
          <Link href="/" className="inline-flex items-center gap-3 rounded-2xl customer-focus-ring">
            <Image
              src="/divy-power-logo.png"
              alt="Divy Power"
              width={148}
              height={52}
              className="h-12 w-auto rounded-xl bg-white/95 p-1"
              priority
            />
            <span className="hidden text-sm font-semibold uppercase tracking-[0.18em] text-orange-200 sm:inline">Customer portal</span>
          </Link>

          <div className="mt-16 max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-100 backdrop-blur">
              <ShieldCheck className="size-3.5" />
              Secure WhatsApp OTP access
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
              A solar app for every customer milestone.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/68">
              Sign in to track orders, verify materials, download project documents, raise support requests, and manage referral rewards.
            </p>
          </div>

          <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
            <TrustItem icon={<SunMedium className="size-5" />} title="Solar project tracking" />
            <TrustItem icon={<Zap className="size-5" />} title="Fast support routing" />
            <TrustItem icon={<CheckCircle2 className="size-5" />} title="Documents in one place" />
          </div>
        </section>

        <aside className="w-full">
          <LoginForm />
          <p className="mt-5 text-center text-xs text-white/55">
            Protected customer access for Divy Power users.
          </p>
        </aside>
      </div>
    </main>
  );
}

function TrustItem({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/10 p-4 text-sm font-semibold text-white backdrop-blur">
      <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-white/10 text-orange-200">
        {icon}
      </div>
      {title}
    </div>
  );
}
