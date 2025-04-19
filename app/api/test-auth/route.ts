import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'No authenticated user found'
      });
    }
    
    // Return user info but mask sensitive data
    return NextResponse.json({
      authenticated: true,
      user: {
        sub: session.user.sub,
        email: session.user.email ? `${session.user.email.substring(0, 3)}...` : null,
        name: session.user.name,
        picture: session.user.picture ? true : false,
        // Include the type of the sub field to help with debugging
        subType: typeof session.user.sub
      }
    });
  } catch (error) {
    console.error('Error in test-auth API route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
