import { Input } from "@components/radix/input"
import { Textarea } from "@components/radix/textarea"
import { cn } from "@utils/tailwind"
import { ChangeEvent } from "react"

interface Props {
	className?: string
	placeholder?: string
	onChange: (newValue: string) => void
	name?: string
	defaultValue?: string
	currentValue?: string
	bigPadding?: boolean
	password?: boolean
	fullWidth?: boolean
	isTextArea?: boolean
	required?: boolean
	isInErrorState?: boolean
}

const TextInput = ({
	className,
	placeholder,
	onChange,
	name,
	defaultValue,
	currentValue,
	bigPadding,
	password,
	fullWidth,
	isTextArea,
	required,
	isInErrorState
}: Props) => {
	const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		event.preventDefault()
		onChange(event.target.value)
	}

	return (
		<>
			{isTextArea ? (
				<Textarea
					className={cn(
						className,
						bigPadding ? "p-[16px]" : "py-[8px] px-[16px]",
						fullWidth ? "w-full" : "w-[240px]",
						isInErrorState ? "border-red-600 border-2" : "border-blue-600/20"
					)}
					name={name}
					placeholder={placeholder}
					onChange={handleChange}
					defaultValue={defaultValue}
					value={currentValue}
					required={required}
				/>
			) : (
				<Input
					className={cn(
						"placeholder:text-blue-600/60 bg-transparent text-sm text-blue-600 ring-offset-blue-600/60",
						"border",
						className,
						bigPadding ? "p-[16px]" : "py-[8px] px-[16px]",
						fullWidth ? "w-full" : "w-[240px]",
						isInErrorState ? "border-red-600 border-2" : "border-blue-600/20"
					)}
					name={name}
					type={password ? "password" : "text"}
					placeholder={placeholder}
					onChange={handleChange}
					defaultValue={defaultValue}
					value={currentValue}
					required={required}
				/>
			)}
		</>
	)
}

export default TextInput
