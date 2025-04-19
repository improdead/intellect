import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { auth0IdToUuid } from '@/lib/auth0-utils';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'No authenticated user found'
      });
    }
    
    const auth0Id = session.user.sub;
    const uuid = auth0IdToUuid(auth0Id);
    
    // Return the mapping
    return NextResponse.json({
      authenticated: true,
      auth0Id,
      uuid,
      user: {
        email: session.user.email ? `${session.user.email.substring(0, 3)}...` : null,
        name: session.user.name,
      }
    });
  } catch (error) {
    console.error('Error in auth0-uuid API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
