import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/btn inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-[background-color,color,box-shadow,transform] outline-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-indigo active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg.lucide-arrow-right]:transition-transform hover:[&_svg.lucide-arrow-right]:translate-x-0.5 [&_svg.lucide-chevron-right]:transition-transform hover:[&_svg.lucide-chevron-right]:translate-x-0.5",
  {
    variants: {
      variant: {
        default: "bg-blue text-white shadow-cta hover:bg-blue-deep",
        ink: "bg-ink text-white hover:bg-ink/85",
        mint: "bg-yellow text-ink hover:bg-yellow/85",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "bg-surface text-foreground shadow-[inset_0_0_0_2px_var(--mevoriq-border)] hover:shadow-[inset_0_0_0_2px_var(--mevoriq-navy)]",
        secondary: "bg-fill text-foreground hover:bg-[#E7E8EE]",
        ghost: "text-foreground hover:bg-fill",
        link: "rounded-none px-0 text-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 text-[15px] has-[>svg]:px-4",
        xs: "h-7 gap-1 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-4 text-[14px]",
        lg: "h-14 px-8 text-[17px]",
        icon: "size-11",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
