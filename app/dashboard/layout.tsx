"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import Sidebar from "@/components/sidebar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push(
        "/api/auth/login?connection=google-oauth2&returnTo=/dashboard"
      );
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex h-screen bg-background font-rubik">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-auto transition-all duration-300 ease-in-out bg-background ml-[60px] md:ml-[250px]">
        <div className="container mx-auto p-6 md:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
