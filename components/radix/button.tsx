import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@utils/tailwind"

const buttonVariants = cva(
	"inline-flex whitespace-nowrap items-center justify-center rounded-[8px] text-sm font-medium focus:ring-2 focus:ring-offset-2 ring-offset-blue-600/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-blue-600 text-white hover:shadow-xl hover:shadow-blue-600/40 focus:bg-blue-700 transition-shadow duration-300 ease-in-out",
				destructive: "bg-red-600 text-white hover:shadow-xl hover:shadow-red-600/40 transition-shadow duration-300 ease-in-out",
				outline: "border border-primary/20 bg-transparent hover:bg-blue-600/10 text-blue-600",
				secondary: "bg-purple-600 text-white hover:bg-purple-600/80",
				ghost: "hover:bg-blue-600/10 text-blue-600",
				link: "text-blue-600 underline-offset-4 hover:underline"
			},
			size: {
				default: "h-[40px] px-4 py-[8px]",
				sm: "h-[36px] rounded-[6px] px-[12px] py-[6px]",
				lg: "h-[44px]",
				icon: "h-[40px] w-[40px]"
			}
		},
		defaultVariants: {
			variant: "default",
			size: "default"
		}
	}
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
	asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : "button"
	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			ref={ref}
			{...props}
		/>
	)
})
Button.displayName = "Button"

export { Button, buttonVariants }
