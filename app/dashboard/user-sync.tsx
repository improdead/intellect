"use client";

import { useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clientDataService } from "@/lib/data-service";

export default function UserSync() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Handle Auth0 errors
    if (error) {
      console.error("Auth0 error:", error);
      toast.error("Authentication error. Please try logging in again.");
      router.push("/api/auth/login");
      return;
    }

    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      console.log("No authenticated user found, redirecting to login");
      router.push("/api/auth/login");
      return;
    }

    // Sync user with database if authenticated
    if (user && user.sub) {
      const syncUser = async () => {
        try {
          // Using POST request to sync user since clientDataService might not have a syncUser method
          const response = await fetch("/api/sync-user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.sub,
              email: user.email || "",
              name: user.name || "",
              picture: user.picture || "",
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to sync user: ${response.status}`);
          }

          console.log("User synced successfully");
        } catch (error) {
          console.error("Error syncing user:", error);
          toast.error("Failed to sync user data. Please refresh the page.");
        }
      };

      syncUser();
    }
  }, [user, error, isLoading, router]);

  // This component doesn't render anything
  return null;
}
