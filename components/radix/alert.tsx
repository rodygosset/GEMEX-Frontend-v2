import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@utils/tailwind"

const alertVariants = cva(
	"relative w-full rounded-[8px] border border-blue-600/20 p-4 [&>svg~*]:pl-[28px] [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
	{
		variants: {
			variant: {
				default: "bg-transparent text-blue-600",
				destructive: "border-red-600/50 text-red-600 dark:border-red-600 [&>svg]:text-red-600"
			}
		},
		defaultVariants: {
			variant: "default"
		}
	}
)

const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>>(
	({ className, variant, ...props }, ref) => (
		<div
			ref={ref}
			role="alert"
			className={cn(alertVariants({ variant }), className)}
			{...props}
		/>
	)
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
	<h5
		ref={ref}
		className={cn("mb-[4px] font-medium leading-none tracking-tight", className)}
		{...props}
	/>
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("text-sm [&_p]:leading-relaxed text-blue-600/80", className)}
		{...props}
	/>
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
