import { AuthOptions } from "@auth0/nextjs-auth0";

// Auth0 configuration options
export const auth0Config: AuthOptions = {
  authorizationParams: {
    // Default to Google login when no connection is specified
    connection: "google-oauth2",
    // Scope for OpenID Connect
    scope: "openid profile email",
    // Response type for Auth0
    response_type: "code",
    // Response mode for Auth0
    response_mode: "query",
  },
  routes: {
    // Route for callback after login
    callback: "/api/auth/callback",
    // Route for login
    login: "/api/auth/login",
    // Route for logout
    logout: "/api/auth/logout",
    // Redirect to home page after logout
    postLogoutRedirect: "/",
    // Redirect to dashboard after login
    loginReturn: "/dashboard",
  },
  session: {
    // Use cookies for session
    strategy: "cookie",
    // Cookie lifetime in seconds (30 days)
    rollingDuration: 60 * 60 * 24 * 30,
    // Absolute cookie lifetime in seconds (30 days)
    absoluteDuration: 60 * 60 * 24 * 30,
  },
};
