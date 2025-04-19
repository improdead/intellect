"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sparkles } from "lucide-react" // Re-add Sparkles import
import { ThemeToggle } from "@/components/theme-toggle"

export default function SiteNavbar() {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 w-full border-b">
      <div className="container flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold">intelect</span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                pathname?.startsWith("/dashboard") ? "text-foreground" : "text-foreground/80"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                pathname === "/pricing" ? "text-foreground" : "text-foreground/80"
              }`}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                pathname === "/about" ? "text-foreground" : "text-foreground/80"
              }`}
            >
              About
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
