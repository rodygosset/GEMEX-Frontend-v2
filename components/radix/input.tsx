import { cn } from "@utils/tailwind"
import * as React from "react"


export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-[4px] bg-white/10 px-[16px] py-[16px] text-sm text-white/80 ring-offset-white/10 placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "autofill:text-slate-500 autofill:ring-2 autofill:ring-ring autofill:ring-offset-2 autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]",
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
