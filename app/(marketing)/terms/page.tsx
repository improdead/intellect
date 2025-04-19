"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function TermsPage() {
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
                  className={`absolute -bottom-1 left-0 ${item === "Terms" ? "w-full" : "w-0"} h-0.5 bg-primary group-hover:w-full transition-all duration-300`}
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
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Terms of Service</h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl text-foreground/80 mb-6">Last updated: April 9, 2023</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using the Intellect platform, you agree to be bound by these Terms of Service and all
              applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from
              using or accessing this platform.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily access the materials on Intellect's platform for personal,
              non-commercial use only. This is the grant of a license, not a transfer of title, and under this license
              you may not:
            </p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on Intellect's platform</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4">3. User Accounts</h2>
            <p>
              When you create an account with us, you guarantee that the information you provide is accurate, complete,
              and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate
              termination of your account on the platform.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your account and password, including but not
              limited to the restriction of access to your computer and/or account. You agree to accept responsibility
              for any and all activities or actions that occur under your account and/or password.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">4. Intellectual Property</h2>
            <p>
              The platform and its original content, features, and functionality are and will remain the exclusive
              property of Intellect and its licensors. The platform is protected by copyright, trademark, and other laws
              of both the United States and foreign countries.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">5. Termination</h2>
            <p>
              We may terminate or suspend your account and bar access to the platform immediately, without prior notice
              or liability, under our sole discretion, for any reason whatsoever and without limitation, including but
              not limited to a breach of the Terms.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">6. Limitation of Liability</h2>
            <p>
              In no event shall Intellect, nor its directors, employees, partners, agents, suppliers, or affiliates, be
              liable for any indirect, incidental, special, consequential or punitive damages, including without
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access
              to or use of or inability to access or use the platform.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">7. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision
              is material we will provide at least 30 days' notice prior to any new terms taking effect. What
              constitutes a material change will be determined at our sole discretion.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">8. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at terms@intellect-learning.com.</p>
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
