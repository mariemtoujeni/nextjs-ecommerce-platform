"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"
import { Button } from "./button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"
import { cn } from "~/lib/utils"

export interface TableAction {
  label: string
  onClick?: () => void
  href?: string
  disabled?: boolean
}

interface TableActionsMenuProps {
  options: TableAction[]
  className?: string
}

export function TableActionsMenu({ options, className }: TableActionsMenuProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("h-8 w-8 p-0 hover:-translate-y-0", className)}
          onClick={() => setOpen(true)}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="end">
        <div className="flex flex-col">
          {options.map((option, index) => {
            const Component = option.href ? "a" : "button"
            return (
              <Component
                key={index}
                href={option.href}
                onClick={() => {
                  option.onClick?.()
                  setOpen(false)
                }}
                disabled={option.disabled}
                className={cn(
                  "flex w-full cursor-pointer items-center px-4 py-2 text-sm outline-none transition-colors",
                  "hover:bg-lime hover:text-accent-foreground",
                  "focus-visible:bg-lime focus-visible:text-accent-foreground",
                  "disabled:pointer-events-none disabled:opacity-50",
                  option.disabled && "cursor-not-allowed opacity-50"
                )}
              >
                {option.label}
              </Component>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
} 