import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { sessionService } from "@/lib/session-service";
import { achievementService } from "@/lib/achievement-service";

// 🔧 Use Node.js runtime to fix cookie errors from `@auth0/nextjs-auth0`
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    console.log("[track-session] API called");

    const session = await getSession();

    if (!session || !session.user) {
      console.log("No authenticated user found for tracking session");
      return NextResponse.json(
        { error: "Authentication required", code: "auth_required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (action === "start") {
      const newSession = await sessionService.startSession(session.user.sub);
      await achievementService.checkAndUpdateAchievements(session.user.sub);

      return NextResponse.json({
        success: true,
        message: "Session started",
        session: newSession,
      });
    } else if (action === "end") {
      const activeSession = await sessionService.getActiveSession(
        session.user.sub
      );

      if (activeSession) {
        await sessionService.endSession(activeSession.id, session.user.sub);
        return NextResponse.json({ success: true, message: "Session ended" });
      } else {
        return NextResponse.json({
          success: false,
          message: "No active session found",
        });
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in track-session API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
