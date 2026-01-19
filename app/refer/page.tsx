"use client";

import { Suspense } from "react";
import ReferLanding from "./refer-landing";

export default function ReferPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReferLanding />
    </Suspense>
  );
}
