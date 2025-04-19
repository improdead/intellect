import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { syncUserWithSupabase } from "@/lib/supabase-auth";

export async function POST(req: Request) {
  try {
    console.log("Received sync-user request");

    // Verify the user is authenticated
    const session = await getSession();

    if (!session?.user) {
      console.log("No authenticated user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Authenticated user:", session.user.sub);

    // Sync the user with Supabase
    const user = await syncUserWithSupabase();

    if (!user) {
      console.log("Failed to sync user with Supabase");
      return NextResponse.json(
        {
          error: "Failed to sync user",
          message:
            "Check server logs for details. This is likely due to a database constraint issue.",
        },
        { status: 500 }
      );
    }

    console.log("User synced successfully:", user.id);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error in sync-user API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
