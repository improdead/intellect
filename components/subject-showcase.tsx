"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import PhysicsSVG from "./subject-svgs/physics-svg"
import MathSVG from "./subject-svgs/math-svg"
import ChemistrySVG from "./subject-svgs/chemistry-svg"
import BiologySVG from "./subject-svgs/biology-svg"

interface SubjectShowcaseProps {
  title: string
  description: string
  topics: string[]
}

export default function SubjectShowcase({ title, description, topics }: SubjectShowcaseProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="space-y-6"
      >
        <div>
          <h3 className="text-3xl font-bold mb-2">{title}</h3>
          <p className="text-foreground/70 text-lg">{description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {topics.map((topic, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
              className="group"
            >
              <Card className="p-4 border-primary/10 hover:bg-primary/5 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <span>{topic}</span>
                  <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Button className="bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300" asChild>
          <Link href="/dashboard">
            <span className="flex items-center gap-2">
              Explore {title}
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        viewport={{ once: true }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl -z-10"></div>
        <div className="relative rounded-2xl overflow-hidden border border-primary/10 shadow-xl h-[400px]">
          {title === "Physics" && <PhysicsSVG />}
          {title === "Mathematics" && <MathSVG />}
          {title === "Chemistry" && <ChemistrySVG />}
          {title === "Biology" && <BiologySVG />}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end">
            <div className="p-6 text-center w-full">
              <Button
                variant="outline"
                className="bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-all duration-300"
                asChild
              >
                <Link href="/dashboard">
                  <span className="flex items-center gap-2">
                    Try Interactive {title} Simulation
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
