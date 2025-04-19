"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  className?: string;
  itemClassName?: string;
  variant?: "card" | "list" | "text" | "circle" | "custom";
  height?: number | string;
  width?: number | string;
  animated?: boolean;
}

export function SkeletonLoader({
  count = 1,
  className,
  itemClassName,
  variant = "card",
  height,
  width,
  animated = true,
  ...props
}: SkeletonLoaderProps) {
  const getSkeletonStyle = () => {
    switch (variant) {
      case "card":
        return "h-[200px] w-full rounded-xl";
      case "list":
        return "h-16 w-full rounded-lg";
      case "text":
        return "h-4 w-full rounded-md";
      case "circle":
        return "h-12 w-12 rounded-full";
      case "custom":
        return "";
      default:
        return "h-[200px] w-full rounded-xl";
    }
  };

  const baseStyle = getSkeletonStyle();
  const customStyle = {
    height: height !== undefined ? height : undefined,
    width: width !== undefined ? width : undefined,
  };

  return (
    <div className={cn("space-y-3", className)} {...props}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="relative overflow-hidden">
          <Skeleton
            className={cn(baseStyle, itemClassName)}
            style={customStyle}
          />
          {animated && (
            <motion.div
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ["0%", "200%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
                delay: index * 0.2,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className, ...props }: React.ComponentProps<typeof SkeletonLoader>) {
  return (
    <SkeletonLoader
      variant="card"
      className={cn("", className)}
      {...props}
    />
  );
}

export function ListSkeleton({ className, ...props }: React.ComponentProps<typeof SkeletonLoader>) {
  return (
    <SkeletonLoader
      variant="list"
      className={cn("", className)}
      {...props}
    />
  );
}

export function TextSkeleton({ className, ...props }: React.ComponentProps<typeof SkeletonLoader>) {
  return (
    <SkeletonLoader
      variant="text"
      className={cn("", className)}
      {...props}
    />
  );
}

export function CircleSkeleton({ className, ...props }: React.ComponentProps<typeof SkeletonLoader>) {
  return (
    <SkeletonLoader
      variant="circle"
      className={cn("", className)}
      {...props}
    />
  );
}

export function SubjectSkeleton() {
  return (
    <div className="w-full">
      <div className="flex items-center gap-5">
        <CircleSkeleton width={64} height={64} className="flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <TextSkeleton width="60%" />
          <TextSkeleton width="80%" />
          <div className="flex items-center gap-2 mt-2">
            <TextSkeleton width={60} />
            <TextSkeleton width={100} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CourseSkeleton() {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-3">
        <CardSkeleton height={160} />
        <TextSkeleton width="70%" />
        <TextSkeleton width="90%" />
        <div className="flex items-center gap-2 mt-1">
          <TextSkeleton width={80} />
          <TextSkeleton width={120} />
        </div>
      </div>
    </div>
  );
}

export function QuizSkeleton() {
  return (
    <div className="w-full">
      <div className="flex items-center gap-4">
        <CircleSkeleton width={48} height={48} className="flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <TextSkeleton width="50%" />
          <TextSkeleton width="70%" />
          <div className="flex items-center gap-2 mt-1">
            <TextSkeleton width={60} />
            <TextSkeleton width={80} />
          </div>
        </div>
      </div>
    </div>
  );
}
