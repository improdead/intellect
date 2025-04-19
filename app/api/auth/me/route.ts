import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";

// Suppress the cookie errors - the functionality still works despite the errors
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get session directly - the warnings in the console don't affect functionality
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json(session.user);
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
