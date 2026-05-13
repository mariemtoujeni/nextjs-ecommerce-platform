import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        blue:
          "border-transparent bg-blue-50 text-blue-600",
        green:
          "border-transparent bg-green-50 text-green-600",
        orange:
          "border-transparent bg-orange-50 text-orange-600",
        red:
          "border-transparent bg-red-50 text-red-600",
        gray:
          "border-transparent bg-neutral-300 text-neutral-600",
      },
      size: {
        sm: "px-2.5 py-0.5 text-xs",
        md: "px-3 py-1 text-base rounded-full",
        lg: "px-4 py-2 text-lg rounded-full",
      }
    },
    defaultVariants: {
      variant: "blue",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
