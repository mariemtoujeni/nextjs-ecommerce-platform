import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"
import { Slot } from "@radix-ui/react-slot";

const headingVariants = cva("font-bebas",
    {
        variants: {
            heading: {
                '1': "font-bold lg:text-9xl text-7xl mb-4",
                '2': "font-bold lg:text-8xl text-6xl mb-3", 
                '3': "font-bold lg:text-7xl text-5xl mb-2",
                '4': "font-bold lg:text-5xl text-4xl mb-1",
                '5': "font-semibold lg:text-xl text-lg mb-1",
                '6': "font-semibold text-lg mb-1",
            },
        },
        defaultVariants: {
            heading: '1',
        },
    }
)

interface HeadingProps 
extends React.HTMLAttributes<HTMLHeadingElement>, 
VariantProps<typeof headingVariants> { 
    asChild?: boolean
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
    ({ className, heading = '1', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : `h${heading}`;

    return (
        <Comp className={cn(headingVariants({ heading }), className)} ref={ref} {...props} />
    )
})

Heading.displayName = "Heading"

export { Heading, headingVariants }