import { NextResponse } from "next/server";
import { getSessionSafely } from "@/lib/auth0-helpers";

export async function GET() {
  try {
    // Get session using our safe wrapper
    const session = await getSessionSafely();

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Return detailed user info for debugging
    return NextResponse.json({
      user: {
        sub: session.user.sub,
        name: session.user.name,
        email: session.user.email,
        picture: session.user.picture,
        picture_type: typeof session.user.picture,
        picture_length: session.user.picture ? session.user.picture.length : 0,
        // Check if picture is a data URL
        is_data_url: session.user.picture?.startsWith('data:') || false,
        // Check if picture is a URL
        is_url: session.user.picture?.startsWith('http') || false,
        // Other properties
        ...Object.keys(session.user).reduce((acc, key) => {
          if (!['sub', 'name', 'email', 'picture'].includes(key)) {
            acc[key] = session.user[key];
          }
          return acc;
        }, {} as Record<string, any>)
      }
    });
  } catch (error) {
    console.error("Error in debug-user API route:", error);
    return NextResponse.json(
      { error: "Internal server error", message: (error as Error).message },
      { status: 500 }
    );
  }
}
