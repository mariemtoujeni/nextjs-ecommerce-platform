"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "~/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  total?: number;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, total, ...props }, ref) => {
  const percentage = total ? (value || 0 / total) : value;
  
  return (
    <div className="flex flex-col items-end gap-1">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
      "relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-green-600 transition-all rounded-r"
      style={{ transform: `translateX(-${100 - (percentage || 0)}%)` }}
    />
    </ProgressPrimitive.Root>
    { undefined !== total ? <span className="text-xs text-muted-foreground me-1">{value} / {total}</span> : null}
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
