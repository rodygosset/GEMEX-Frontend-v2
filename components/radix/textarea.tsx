import { cn } from "@utils/tailwind"
import * as React from "react"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
	return (
		<textarea
			className={cn(
				"flex min-h-[80px] w-full rounded-[8px] border border-blue-600/20 p-[16px] text-sm text-blue-600",
				"ring-offset-blue-600/60 placeholder:text-blue-600/60 focus-visible:outline-none bg-transparent",
				"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				"autofill:text-slate-500 autofill:ring-2 autofill:ring-ring autofill:ring-offset-2 autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]",
				className
			)}
			ref={ref}
			{...props}
		/>
	)
})
Textarea.displayName = "Textarea"

export { Textarea }
