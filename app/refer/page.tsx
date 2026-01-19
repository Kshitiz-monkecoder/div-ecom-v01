"use client";

import { Suspense } from "react";
import ReferForm from "./ReferForm";

export default function ReferPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReferForm />
    </Suspense>
  );
}
