import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: 'btcm-button-primary',
        secondary: 'btcm-button-secondary',
        tertiary: 'btcm-button-tertiary',
        buy: 'btcm-button-buy',
        sell: 'btcm-button-sell',
        ghost: 'btcm-button-ghost',
        link: 'btcm-button-link',
        destructive: 'btcm-button-destructive',
      },
      size: {
        sm: "min-h-8 px-4 space-x-1 btcm-button-sm",
        md: "min-h-10 px-4 space-x-1-5 btcm-button-md",
        lg: "min-h-10 px-8 space-x-1-5 btcm-button-md ",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "tertiary",
      size: "md",
    },
  }
)

const sizeClasses = {
  sm: "btcm-button-sm",
  md: "btcm-button-md",
  lg: "btcm-button-md",
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  useCustomSize?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, leftIcon, rightIcon, useCustomSize = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const customSizeClass = useCustomSize && size && size in sizeClasses ? sizeClasses[size as keyof typeof sizeClasses] : ''
    return (
      <Comp
        className={cn(buttonVariants({ variant: useCustomSize ? undefined : variant, size, className }), customSizeClass)}
        ref={ref}
        disabled={props.disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
