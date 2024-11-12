import Label from "@components/form-elements/label"
import { OnFilterToggleHandler } from "@conf/api/search"
import FilterCheckBox from "./filter-checkbox"
import { Switch } from "@components/radix/switch"
import { cn } from "@utils/tailwind"

interface Props {
	inline?: boolean
	filterName: string
	label: string
	children: any
	checked: boolean
	onCheckToggle: OnFilterToggleHandler
}

const FilterWrapper = ({ inline = false, filterName, label, children, checked, onCheckToggle }: Props) => {
	const handleCheckToggle = (newChecked: boolean) => onCheckToggle(filterName, newChecked)

	return (
		<div className={cn("w-full gap-4", inline ? "flex flex-wrap items-center justify-between" : "flex flex-col")}>
			<div className="flex items-center gap-[8px]">
				<Switch
					checked={checked}
					onCheckedChange={handleCheckToggle}
				/>
				<Label>{label}</Label>
			</div>
			{children}
		</div>
	)
}

export default FilterWrapper
