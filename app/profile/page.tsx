import { getSession } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    redirect("/api/auth/login?connection=google-oauth2");
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-6">
          {user.picture && (
            <img
              src={user.picture || "/placeholder.svg"}
              alt={user.name || "User"}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <h3 className="font-medium mb-2">User Information</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">
                User ID
              </dt>
              <dd className="text-sm font-medium truncate">{user.sub}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">
                Last Updated
              </dt>
              <dd className="text-sm font-medium">
                {user.updated_at
                  ? new Date(user.updated_at).toLocaleString()
                  : "N/A"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex justify-end">
          <Link href="/api/auth/logout">
            <Button
              variant="outline"
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Sign Out
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
