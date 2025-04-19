import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

// Function to require authentication on server components
export async function requireAuth() {
  const session = await getSession();
  
  if (!session || !session.user) {
    redirect('/api/auth/login');
  }
  
  return session.user;
}

// Function to protect API routes
export function withAuth(handler: Function) {
  return withApiAuthRequired(async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  });
}
