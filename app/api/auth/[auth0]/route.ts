import { handleAuth } from "@auth0/nextjs-auth0";
import { auth0Config } from "@/lib/auth0-config";

// Create a handler for all Auth0 API routes with custom configuration
export const GET = handleAuth(auth0Config);
