"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react" // Re-add Sparkles import
import { ThemeToggle } from "@/components/theme-toggle"

export function DockHeader() {
  const [mounted, setMounted] = useState(false)
  // Simplified auth state - we'll replace this with real auth later
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check if we have a token in localStorage (this is just for UI demonstration)
    const hasToken = typeof window !== "undefined" && localStorage.getItem("demo-token")
    setIsLoggedIn(!!hasToken)
  }, [])

  // Handle demo login/logout
  const handleDemoLogin = () => {
    localStorage.setItem("demo-token", "demo-user")
    setIsLoggedIn(true)
  }

  const handleDemoLogout = () => {
    localStorage.removeItem("demo-token")
    setIsLoggedIn(false)
  }

  if (!mounted) return null

  return (
    <div className="w-full flex justify-center fixed top-0 left-0 right-0 z-50 pt-4 px-4">
      <motion.div
        className="flex items-center justify-between px-6 py-3 bg-background/95 backdrop-blur-sm rounded-full max-w-6xl w-full border border-border/40 shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Intellect</span>
        </Link>

        {/* Navigation - Only showing working links */}
        <div className="hidden md:flex items-center gap-8">
          <PricingLink />
          <ThemeToggle />
        </div>

        {/* CTA Buttons with smooth text-to-arrow transitions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  U
                </div>
              </Link>
              <Button
                variant="outline"
                className="rounded-full px-6 border-primary/50 hover:border-primary hover:bg-primary/10"
                onClick={handleDemoLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <div className="md:hidden">
                <ThemeToggle />
              </div>
              <LoginButton onClick={handleDemoLogin} />
              <SignUpButton />
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// Pricing link with hover animation
function PricingLink() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className="relative">
      <Link href="/pricing" className="text-foreground/80 hover:text-foreground transition-colors py-2">
        Pricing
      </Link>
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
        initial={{ width: 0 }}
        animate={{ width: isHovered ? "100%" : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </motion.div>
  )
}

// Login button with text-to-arrow transition
function LoginButton({ onClick }: { onClick?: () => void }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant="outline"
        className="rounded-full px-6 border-primary/50 hover:border-primary hover:bg-primary/10 overflow-hidden h-10 w-24"
        onClick={onClick}
        asChild={!onClick}
      >
        {onClick ? (
          <div className="relative flex items-center justify-center">
            <div className="relative h-5 w-full overflow-hidden">
              {/* Text element */}
              <motion.span
                className="absolute w-full text-center"
                initial={{ y: 0 }}
                animate={{ y: isHovered ? -30 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                Login
              </motion.span>

              {/* Arrow element */}
              <motion.span
                className="absolute w-full flex justify-center text-primary"
                initial={{ y: 30 }}
                animate={{ y: isHovered ? 0 : 30 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.span>
            </div>
          </div>
        ) : (
          <Link href="/login" className="relative flex items-center justify-center">
            <div className="relative h-5 w-full overflow-hidden">
              {/* Text element */}
              <motion.span
                className="absolute w-full text-center"
                initial={{ y: 0 }}
                animate={{ y: isHovered ? -30 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                Login
              </motion.span>

              {/* Arrow element */}
              <motion.span
                className="absolute w-full flex justify-center text-primary"
                initial={{ y: 30 }}
                animate={{ y: isHovered ? 0 : 30 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.span>
            </div>
          </Link>
        )}
      </Button>
    </motion.div>
  )
}

// Sign up button with text-to-arrow transition
function SignUpButton() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        className="bg-amber-400 hover:bg-amber-500 text-black font-medium rounded-full px-6 overflow-hidden h-12 w-28"
        asChild
      >
        <Link href="/login" className="relative flex items-center justify-center">
          <div className="relative h-6 w-full overflow-hidden">
            {/* Text element */}
            <motion.span
              className="absolute w-full text-center"
              initial={{ y: 0 }}
              animate={{ y: isHovered ? -30 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              Sign up
            </motion.span>

            {/* Arrow element */}
            <motion.span
              className="absolute w-full flex justify-center"
              initial={{ y: 30 }}
              animate={{ y: isHovered ? 0 : 30 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.span>
          </div>
        </Link>
      </Button>
    </motion.div>
  )
}
