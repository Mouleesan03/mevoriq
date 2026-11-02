import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-2xl border-0 bg-fill px-4 py-3 text-[16px] transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:shadow-[inset_0_0_0_2px_var(--mevoriq-indigo),0_0_0_5px_var(--mevoriq-sky)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
