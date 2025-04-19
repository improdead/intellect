"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle background patterns */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#7c3aed_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#7c3aed10_1px,transparent_1px)] [background-size:40px_40px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#7c3aed10_1px,transparent_1px)] [background-size:40px_40px]"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 md:p-6 backdrop-blur-md bg-background/70 border-b border-primary/5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Intellect</span>
          </Link>
        </motion.div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            {["Features", "About", "Privacy", "Terms"].map((item) => (
              <Link
                key={item}
                href={item === "Features" ? `/#features` : `/${item.toLowerCase()}`}
                className="text-foreground/80 hover:text-foreground transition-colors relative group"
              >
                {item}
                <span
                  className={`absolute -bottom-1 left-0 ${item === "Privacy" ? "w-full" : "w-0"} h-0.5 bg-primary group-hover:w-full transition-all duration-300`}
                ></span>
              </Link>
            ))}
          </nav>

          <ThemeToggle />
        </div>
      </header>

      <main className="container max-w-4xl mx-auto pt-32 pb-20">
        <Button variant="ghost" size="sm" className="mb-8" asChild>
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl text-foreground/80 mb-6">Last updated: April 9, 2023</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">1. Introduction</h2>
            <p>
              At Intellect, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our educational platform. Please read this privacy policy
              carefully. If you do not agree with the terms of this privacy policy, please do not access the platform.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when you register for an account, create or modify
              your profile, set preferences, or make purchases through the platform. This information may include:
            </p>
            <ul>
              <li>Name, email address, and password</li>
              <li>Profile information, such as educational background</li>
              <li>Payment information (processed securely through our payment processors)</li>
              <li>Content you submit, post, or display on the platform</li>
              <li>Learning preferences and progress data</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your learning experience</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4">4. Data Security</h2>
            <p>
              We have implemented appropriate technical and organizational security measures designed to protect the
              security of any personal information we process. However, please also remember that we cannot guarantee
              that the internet itself is 100% secure.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">5. Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, such as the
              right to access, correct, or delete your personal information.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">6. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the "Last Updated" date.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@intellect-learning.com.
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-primary/10 py-8 backdrop-blur-md bg-background/70">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-bold">Intellect</span>
            </div>

            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/about" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                About
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
