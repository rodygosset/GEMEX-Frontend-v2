"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"
import { cn } from "@utils/tailwind"

const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>>(
	({ className, ...props }, ref) => {
		return (
			<RadioGroupPrimitive.Root
				className={cn("grid gap-[8px]", className)}
				{...props}
				ref={ref}
			/>
		)
	}
)
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>>(
	({ className, children, ...props }, ref) => {
		return (
			<RadioGroupPrimitive.Item
				ref={ref}
				className={cn(
					"aspect-square h-[16px] w-[16px] rounded-full border border-primary text-primary ring-offset-blue-600/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
					className
				)}
				{...props}>
				<RadioGroupPrimitive.Indicator className="flex items-center justify-center">
					<Circle className="h-[10px] w-[10px] fill-current text-current" />
				</RadioGroupPrimitive.Indicator>
			</RadioGroupPrimitive.Item>
		)
	}
)
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
