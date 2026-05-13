import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { LucideIcon } from "lucide-react"

import { cn } from "~/lib/utils"

const ButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm uppercase font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:-translate-y-1",
  {
    variants: {
      variant: {
        default:
          "border border-lime bg-lime text-primary-foreground font-bold hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
        outline:
          "border border-black bg-transparent text-primary-foreground font-bold hover:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground font-bold hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-4 py-3 text-l/4",
        sm: "px-2 py-1 text-l/4",
        lg: "px-6 py-4 text-xl/5",
        icon: "p-3",
      },
      hasIcon: {
        true: "",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      hasIcon: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ButtonVariants> {
  asChild?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, hasIcon, asChild = false, icon: Icon, iconPosition = "left", children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Définir la taille de l'icône en fonction de la taille du bouton
    const getIconSize = () => {
      switch (size) {
        case "sm": return 14;
        case "lg": return 20;
        case "icon": return 16;
        default: return 16; // default size
      }
    };

    const iconSize = getIconSize();
    
    // Si hasIcon est true mais aucune icône n'est fournie, lancer un avertissement
    if (hasIcon === true && !Icon) {
      console.warn("Button a la variante hasIcon=true mais aucune icône n'est fournie via la prop icon.");
    }
    
    return (
      <Comp
        className={cn(ButtonVariants({ variant, size, hasIcon: !!Icon, className }))}
        ref={ref}
        {...props}
      >
        {Icon && iconPosition === "left" && <Icon size={iconSize} />}
        {children}
        {Icon && iconPosition === "right" && <Icon size={iconSize} />}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, ButtonVariants }
