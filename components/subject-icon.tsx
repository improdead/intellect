"use client";

import {
  Zap,
  Brain,
  Sparkles,
  Lightbulb,
  BookOpen,
  Globe,
  Code,
  Music,
  Palette,
  Calculator,
  Microscope,
  Atom,
  Dna,
  Leaf,
  Rocket,
  LucideIcon,
} from "lucide-react";

// Map of subject titles to icons
const iconMap: Record<string, LucideIcon> = {
  Physics: Zap,
  Mathematics: Calculator,
  Chemistry: Atom,
  Biology: Dna,
  "Computer Science": Code,
  Geography: Globe,
  Literature: BookOpen,
  Art: Palette,
  Music: Music,
  Astronomy: Rocket,
  Botany: Leaf,
  Microbiology: Microscope,
  Psychology: Brain,
  Philosophy: Lightbulb,
  // Default icon for any other subject
  default: Sparkles,
};

// Map of subject titles to gradient colors
const colorMap: Record<string, string> = {
  Physics: "#4287f5",
  Mathematics: "#36b37e",
  Chemistry: "#f5a142",
  Biology: "#e85b7c",
  "Computer Science": "#7855f7",
  Geography: "#36b37e",
  Literature: "#f5a142",
  Art: "#d946ef",
  Music: "#8b5cf6",
  Astronomy: "#4361ee",
  Botany: "#65a30d",
  Microbiology: "#0d9488",
  Psychology: "#9333ea",
  Philosophy: "#f59e0b",
  // Default gradient for any other subject
  default: "#64748b",
};

export function getSubjectIcon(title: string): LucideIcon {
  return iconMap[title] || iconMap.default;
}

export function getSubjectColor(title: string): string {
  return colorMap[title] || colorMap.default;
}

interface SubjectIconProps {
  title: string;
  className?: string;
}

export function SubjectIcon({ title, className = "" }: SubjectIconProps) {
  const Icon = getSubjectIcon(title);
  return <Icon className={className} />;
}
