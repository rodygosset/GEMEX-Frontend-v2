import { cn } from "@utils/tailwind"
import NumberInput from "../number-input"

interface Props {
	className?: string
	grade: string
	count: number
	onChange: (count: number) => void
	max?: number
	min?: number
}

const GradeCountInput = ({ className, grade, count, onChange, max, min }: Props) => {
	const handleIncrement = () => (max ? onChange(Math.min(count + 1, max)) : onChange(count + 1))

	return (
		<div className={cn("flex flex-col gap-[8px]", className)}>
			<div
				onClick={handleIncrement}
				className={cn(
					"flex flex-col items-center justify-center text-xl font-semibold text-blue-600 p-[16px] rounded-[8px] border border-blue-600/20 cursor-pointer",
					"focus:ring-2 focus:ring-offset-2 ring-offset-blue-600/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/20 focus-visible:ring-offset-2"
				)}>
				{grade}
				<NumberInput
					value={count}
					onChange={onChange}
					min={min}
					max={max}
					embed
					inputClassName="text-fuchsia-600 w-[48px]"
				/>
			</div>
		</div>
	)
}

export default GradeCountInput
