"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { FloatingElement } from "@/components/parallax-scroll";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();


  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (user && !isLoading) {
      router.push("/dashboard");
      return;
    }

    // No cleanup needed
    return () => {};
  }, [user, isLoading, router]);



  const handleLogin = () => {
    window.location.href =
      "/api/auth/login?connection=google-oauth2&returnTo=/dashboard";
  };

  // Show loading state while checking authentication or redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">

      {/* Background elements */}
      <div className="absolute inset-0 -z-10 bg-background/80 backdrop-blur-sm overflow-hidden">
        <div className="absolute w-full h-full bg-grid-pattern opacity-30"></div>
      </div>

      {/* Floating elements */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        <FloatingElement
          xFactor={30}
          yFactor={20}
          duration={6}
          className="absolute top-[15%] right-[10%]"
        >
          <div className="w-32 h-32 rounded-full bg-purple-500/10 blur-xl" />
        </FloatingElement>
        <FloatingElement
          xFactor={25}
          yFactor={35}
          duration={8}
          delay={1}
          className="absolute top-[65%] left-[15%]"
        >
          <div className="w-40 h-40 rounded-full bg-blue-500/10 blur-xl" />
        </FloatingElement>
        <FloatingElement
          xFactor={20}
          yFactor={15}
          duration={7}
          delay={2}
          className="absolute bottom-[20%] right-[20%]"
        >
          <div className="w-24 h-24 rounded-full bg-indigo-500/10 blur-xl" />
        </FloatingElement>
      </div>

      <div className="z-20 relative">
        {isLoading ? (
          <motion.div
            className="p-10 bg-background/50 backdrop-blur-md rounded-2xl border border-primary/10 shadow-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <motion.p
              className="text-xl font-medium text-foreground mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Preparing your learning experience...
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            className="p-10 bg-background/50 backdrop-blur-md rounded-2xl border border-primary/10 shadow-xl max-w-md w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome to Intellect
              </h1>
              <p className="text-muted-foreground">
                Your AI learning companion awaits
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button
                onClick={handleLogin}
                className="w-full py-6 text-lg group"
              >
                <span className="flex items-center justify-center">
                  Continue with Google
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
