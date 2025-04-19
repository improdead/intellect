"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { useUser } from "@auth0/nextjs-auth0/client";

export function ProfileClient() {
  const { user, isLoading, error } = useUser();
  const [userData, setUserData] = useState<any>(null);

  // Fetch detailed user data
  useEffect(() => {
    if (user && !isLoading) {
      fetch("/api/debug-user")
        .then(res => res.json())
        .then(data => {
          console.log("Debug user data:", data);
          setUserData(data.user);
        })
        .catch(err => {
          console.error("Error fetching debug user data:", err);
        });
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div>
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-red-500">Error loading profile</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {error?.message || "Please log in to view your profile."}
          </p>
          <div className="mt-6">
            <Link href="/api/auth/login?connection=google-oauth2">
              <Button>Log In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-shrink-0">
            <UserAvatar
              user={user}
              className="w-16 h-16"
              fallbackClassName="bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <h3 className="font-medium mb-2">User Information</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">
                User ID
              </dt>
              <dd className="text-sm font-medium truncate">{user.sub}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">
                Last Updated
              </dt>
              <dd className="text-sm font-medium">
                {user.updated_at
                  ? new Date(user.updated_at).toLocaleString()
                  : "N/A"}
              </dd>
            </div>
          </dl>
        </div>

        {userData && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <h3 className="font-medium mb-2">Debug Information</h3>
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto text-xs">
              <pre>{JSON.stringify(userData, null, 2)}</pre>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Link href="/api/auth/logout">
            <Button
              variant="outline"
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Sign Out
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
