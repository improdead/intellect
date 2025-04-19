"use client"
import { FloatingNav } from "@/components/ui/floating-navbar"
import { Home, BookOpen, MessageSquare, GraduationCap } from "lucide-react"

export default function FloatingNavDemo() {
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <Home className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Courses",
      link: "/courses",
      icon: <BookOpen className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Chat",
      link: "/dashboard/chat",
      icon: <MessageSquare className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Progress",
      link: "/dashboard/progress",
      icon: <GraduationCap className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
  ]

  return (
    <div className="relative w-full">
      <FloatingNav navItems={navItems} className="bg-white/80 backdrop-blur-md dark:bg-black/80" />
    </div>
  )
}
