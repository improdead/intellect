# Known Issues

## Auth0 Cookie Warnings in Next.js 15.3.0

When running the application, you may see warnings in the console like:

```
Error: Route "/api/track-session" used `cookies().getAll()`. `cookies()` should be awaited before using its value.
```

### Explanation

These warnings are related to how the Auth0 SDK interacts with Next.js 15.3.0's cookies API. In Next.js 15.3.0, the `cookies()` function needs to be awaited before using it, but the Auth0 SDK doesn't do this properly.

### Impact

These warnings **do not affect the functionality** of your application. Authentication, session management, and all other features will continue to work correctly despite these warnings.

### Solution

We've added comments to the code to explain these warnings and implemented a helper function (`getSessionSafely`) to try to mitigate them. However, a complete fix would require changes to the Auth0 SDK itself.

If the warnings are bothersome, you can:

1. Downgrade to Next.js 15.2.x (not recommended)
2. Wait for Auth0 to update their SDK to be compatible with Next.js 15.3.0
3. Ignore the warnings as they don't affect functionality

## Database Tables

The application requires the following tables in your Supabase database:

1. `history` - For tracking user activity
2. `quiz_attempts` - For storing quiz results

SQL scripts to create these tables are provided in the `docs` folder:

- `docs/create_history_table.sql`
- `docs/create_quiz_attempts.sql`

Run these scripts in the Supabase SQL Editor to create the necessary tables.
