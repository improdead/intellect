import * as React from "react"
import { cn } from "@/lib/utils"

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  size?: "sm" | "md" | "lg"
}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "text-xs px-1.5 py-0.5 min-w-5 h-5",
      md: "text-sm px-2 py-1 min-w-6 h-6",
      lg: "text-base px-2.5 py-1.5 min-w-7 h-7",
    }

    return (
      <kbd
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md border border-border bg-muted font-mono font-medium text-muted-foreground shadow-sm",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
Kbd.displayName = "Kbd"

export { Kbd }
