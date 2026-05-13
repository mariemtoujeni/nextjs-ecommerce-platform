import * as React from "react"

import { cn } from "~/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full border-b border-black bg-transparent py-1.5 px-0 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-neutral-300 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm hover:bg-accent",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
