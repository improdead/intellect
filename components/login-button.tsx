"use client";
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";

export function LoginButton() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="border text-sm font-medium relative border-neutral-200 dark:border-white/[0.2] text-black dark:text-white px-4 py-2 rounded-full">
        <span>Loading...</span>
      </div>
    );
  }

  if (user) {
    return (
      <Link
        href="/profile"
        className="border text-sm font-medium relative border-neutral-200 dark:border-white/[0.2] text-black dark:text-white px-4 py-2 rounded-full"
      >
        <span>Profile</span>
        <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px" />
      </Link>
    );
  }

  return (
    <Link
      href="/api/auth/login?connection=google-oauth2"
      className="border text-sm font-medium relative border-neutral-200 dark:border-white/[0.2] text-black dark:text-white px-4 py-2 rounded-full"
    >
      <span>Login</span>
      <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px" />
    </Link>
  );
}
