import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@auth0/nextjs-auth0/edge";
import { sessionService } from "@/lib/session-service";

// This middleware tracks user sessions
export async function sessionTrackerMiddleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSession(req, res);
  
  // If user is authenticated, track the session
  if (session?.user) {
    // We can't directly call our service from edge middleware
    // So we'll make an API call to our session tracking endpoint
    const sessionUrl = new URL("/api/track-session", req.url);
    fetch(sessionUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "start",
        userId: session.user.sub,
      }),
    }).catch(err => {
      console.error("Error tracking session:", err);
    });
  }

  return res;
}
