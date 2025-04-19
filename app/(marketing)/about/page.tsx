"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AboutPage() {
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
                  className={`absolute -bottom-1 left-0 ${item === "About" ? "w-full" : "w-0"} h-0.5 bg-primary group-hover:w-full transition-all duration-300`}
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
          <h1 className="text-4xl md:text-5xl font-bold mb-8">About Intellect</h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl text-foreground/80 mb-6">
              Intellect is revolutionizing education through AI-powered interactive learning experiences.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">Our Mission</h2>
            <p>
              At Intellect, we believe that education should be accessible, engaging, and personalized. Our mission is
              to transform the way people learn by leveraging cutting-edge AI technology to create interactive learning
              experiences that adapt to each individual's needs and learning style.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">Our Story</h2>
            <p>
              Founded in 2023 by a team of educators, AI researchers, and learning scientists, Intellect was born from a
              shared vision: to create a learning platform that could understand and respond to the unique needs of each
              learner.
            </p>
            <p>
              We recognized that traditional educational approaches often fail to engage students and adapt to their
              individual learning styles. By combining advanced AI with interactive simulations and visualizations,
              we've created a platform that makes complex concepts easier to understand and remember.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">Our Team</h2>
            <p>
              Our diverse team brings together expertise in artificial intelligence, education, cognitive science, and
              software development. We're united by our passion for learning and our belief in the transformative power
              of technology in education.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">Join Us</h2>
            <p>
              We're always looking for talented individuals who share our vision and want to make a difference in
              education. If you're passionate about AI, education, or both, we'd love to hear from you.
            </p>

            <div className="mt-10">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/#features">Explore Our Features</Link>
              </Button>
            </div>
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
