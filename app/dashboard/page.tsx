"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  // Redirect to the intellect page
  useEffect(() => {
    router.push('/dashboard/intelect');
  }, [router]);

  // Return empty div while redirecting
  return <div></div>;
}
