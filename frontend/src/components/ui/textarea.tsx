import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-surface)] backdrop-blur-xl px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground transition-all duration-500 ease-[var(--ease-spring)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary focus-visible:shadow-[var(--shadow-glow)] focus-visible:bg-[var(--glass-floating)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02),0_2px_8px_rgba(0,0,0,0.02)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
