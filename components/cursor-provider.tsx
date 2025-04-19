"use client";

import React from "react";
import dynamic from "next/dynamic";

// Import the custom cursor component with dynamic loading to avoid SSR issues
const CustomCursor = dynamic(
  () => import("@/components/custom-cursor").then((mod) => mod.CustomCursor),
  {
    ssr: false,
  }
);

export function CursorProvider() {
  return <CustomCursor />;
}
