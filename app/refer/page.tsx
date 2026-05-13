"use client";

import { Suspense } from "react";
import ReferLanding from "./refer-landing";

export default function ReferPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-sm text-slate-500">Loading consultation page...</div>}>
      <ReferLanding />
    </Suspense>
  );
}
