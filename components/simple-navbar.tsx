"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sparkles } from "lucide-react" // Re-add Sparkles import

export function SimpleNavbar() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in (demo)
    const token = localStorage.getItem("demo-token")
    setIsLoggedIn(!!token)
  }, [])

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4 w-full">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <span className="font-bold text-lg">Intellect</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className={`text-sm font-medium ${
              pathname?.startsWith("/dashboard")
                ? "text-purple-600"
                : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/courses"
            className={`text-sm font-medium ${
              pathname?.startsWith("/courses")
                ? "text-purple-600"
                : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
            }`}
          >
            Courses
          </Link>
          <Link
            href="/about"
            className={`text-sm font-medium ${
              pathname === "/about"
                ? "text-purple-600"
                : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
            }`}
          >
            About
          </Link>

          {isLoggedIn ? (
            <Link
              href="/profile"
              className="ml-4 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-200 transition-colors"
            >
              Profile
            </Link>
          ) : (
            <Link
              href="/login"
              className="ml-4 px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
