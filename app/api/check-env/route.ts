import { NextResponse } from "next/server";

export async function GET() {
  // Check environment variables without exposing their actual values
  const envStatus = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    AUTH0_SECRET: !!process.env.AUTH0_SECRET,
    AUTH0_BASE_URL: !!process.env.AUTH0_BASE_URL,
    AUTH0_ISSUER_BASE_URL: !!process.env.AUTH0_ISSUER_BASE_URL,
    AUTH0_CLIENT_ID: !!process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: !!process.env.AUTH0_CLIENT_SECRET,
  };

  return NextResponse.json({ 
    status: "Environment variables check",
    variables: envStatus,
    nodeEnv: process.env.NODE_ENV
  });
}
