"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUser } from "@auth0/nextjs-auth0/client";

export function MainNavbar() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoading } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="w-full bg-background/95 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl font-robit-bold">intelect</span>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/about"
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            <span className="font-robit-regular">About</span>
          </Link>
          <Link
            href="/terms"
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            <span className="font-robit-regular">Terms</span>
          </Link>
          <Link
            href="/privacy"
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            <span className="font-robit-regular">Privacy</span>
          </Link>
        </div>

        {/* CTA Buttons with smooth text-to-arrow transitions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isLoading ? (
            <div className="h-10 w-24 rounded-full bg-muted animate-pulse"></div>
          ) : user ? (
            <GoToAppButton />
          ) : (
            <>
              <LoginButton />
              <SignUpButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// Login button with text-to-arrow transition
function LoginButton() {
  const [isHovered, setIsHovered] = useState(false);

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
        asChild
      >
        <Link
          href="/login?returnTo=/dashboard"
          className="relative flex items-center justify-center"
        >
          <div className="relative h-5 w-full overflow-hidden">
            {/* Text element */}
            <motion.span
              className="absolute w-full text-center"
              initial={{ y: 0 }}
              animate={{ y: isHovered ? -30 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <span className="font-robit-medium">Login</span>
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
      </Button>
    </motion.div>
  );
}

// Sign up button with text-to-arrow transition
function SignUpButton() {
  const [isHovered, setIsHovered] = useState(false);

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
        <Link
          href="/login?returnTo=/dashboard"
          className="relative flex items-center justify-center"
        >
          <div className="relative h-6 w-full overflow-hidden">
            {/* Text element */}
            <motion.span
              className="absolute w-full text-center"
              initial={{ y: 0 }}
              animate={{ y: isHovered ? -30 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <span className="font-robit-medium">Sign up</span>
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
  );
}

// Profile picture button for authenticated users
function GoToAppButton() {
  const { user } = useUser();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Link href="/dashboard" className="block">
        <div className="relative">
          {/* Profile picture */}
          {user?.picture ? (
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-300 shadow-sm">
              <img
                src={user.picture}
                alt={user.name || "User"}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center border-2 border-transparent hover:border-primary transition-all duration-300 shadow-sm">
              <User className="h-5 w-5 text-primary" />
            </div>
          )}

          {/* Hover indicator */}
          <motion.div
            className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full flex items-center justify-center h-5 w-5 text-xs shadow-md"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowRight className="h-3 w-3" />
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}
