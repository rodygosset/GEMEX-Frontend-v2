import { SelectOption } from "@utils/react-select/types"
import { cn } from "@utils/tailwind"

interface GradeRadioGroupItemProps {
	name?: string
	label: string
	description: string
	value: string
	selected: boolean
	onClick?: () => void
}

export const GradeRadioGroupItem = ({ name, label, description, value, selected, onClick }: GradeRadioGroupItemProps) => (
	<div
		className={cn(
			"min-w-[120px] flex-1 flex flex-col p-[16px] rounded-[8px] gap-[4px] border border-blue-600/20",
			onClick ? "cursor-pointer hover:bg-blue-600/5 transition-colors duration-200" : "cursor-not-allowed",
			selected && "border-2 border-blue-600 bg-blue-600/5"
		)}
		onClick={onClick}>
		<input
			type="radio"
			name={name}
			value={value}
			checked={selected}
			className="sr-only"
			onChange={(e) => {
				if (e.target.checked && onClick) onClick()
			}}
		/>
		<span className="text-md font-bold text-blue-600">{label}</span>
		<span className="text-sm font-medium text-blue-600/60">{description}</span>
	</div>
)

interface GradeRadioGroupProps {
	className?: string
	name?: string
	selected: string
	onSelect?: (value: string) => void
}

interface GradeOption extends SelectOption<string> {
	description: string
}

const grades: GradeOption[] = [
	{ value: "a", label: "A", description: "Très bien" },
	{ value: "b", label: "B", description: "Bien" },
	{ value: "c", label: "C", description: "Moyen" },
	{ value: "d", label: "D", description: "Médiocre" },
	{ value: "e", label: "E", description: "Très mauvais" }
]

export const GradeRadioGroup = ({ className, name, selected, onSelect }: GradeRadioGroupProps) => (
	<div className={cn("flex flex-wrap gap-[16px] items-center", className)}>
		{grades.map((gradeOption) => (
			<GradeRadioGroupItem
				key={gradeOption.value}
				name={name}
				label={gradeOption.label}
				description={gradeOption.description}
				value={gradeOption.value}
				selected={selected === gradeOption.value}
				onClick={onSelect ? () => onSelect(gradeOption.value) : undefined}
			/>
		))}
	</div>
)
