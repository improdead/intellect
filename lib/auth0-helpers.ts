import { getSession, Session } from "@auth0/nextjs-auth0";
import { cookies } from "next/headers";

/**
 * Gets the Auth0 session with proper cookie handling for Next.js 15.3.0+
 * This avoids the "cookies() should be awaited" warnings
 */
export async function getSessionSafely(): Promise<Session | null | undefined> {
  try {
    // Create a new Promise to handle the cookies() call properly
    const cookieStore = await Promise.resolve(cookies());

    // Now that cookies have been properly awaited, get the session
    return await getSession();
  } catch (error) {
    console.error("Error in getSessionSafely:", error);
    return null;
  }
}

/**
 * Converts an Auth0 ID (sub) to a UUID format for Supabase
 * @param auth0Id The Auth0 ID (sub) from the session
 * @returns A UUID string that can be used with Supabase
 */
export function auth0IdToUuid(auth0Id: string): string {
  // Extract the unique part after the | character
  const parts = auth0Id.split("|");
  const uniqueId = parts[parts.length - 1];

  // If it's already a UUID, return it
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      uniqueId
    )
  ) {
    return uniqueId;
  }

  // Otherwise, create a deterministic UUID from the Auth0 ID
  // This is a simple implementation - in production you might want a more robust solution
  let uuid = "00000000-0000-0000-0000-000000000000";
  if (uniqueId && uniqueId.length >= 12) {
    const id = uniqueId.replace(/[^a-zA-Z0-9]/g, "");
    uuid = `${id.substring(0, 8)}-${id.substring(8, 12)}-4${id.substring(
      13,
      16
    )}-${id.substring(16, 20)}-${id.substring(20, 32)}`;
  }

  return uuid;
}
