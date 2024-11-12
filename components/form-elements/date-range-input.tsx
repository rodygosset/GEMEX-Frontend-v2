import FieldContainer from "./field-container"
import Label from "./label"
import DateInput from "./date-input"
import { APIDateRange, DateFormat } from "@utils/types"
import { toISO } from "@utils/general"

interface Props {
	name: string
	value?: APIDateRange
	showLocaleDate?: boolean
	format?: DateFormat
	minDate?: Date
	maxDate?: Date
	onChange: (newValue: APIDateRange) => void
}

const DateRangeInput = ({ name, value, showLocaleDate, format = "dd/MM/yyyy", minDate, maxDate, onChange }: Props) => {
	// render

	return (
		<div className="w-full flex flex-col gap-4">
			<FieldContainer fullWidth>
				<Label>Date de début</Label>
				<DateInput
					name={name + "_debut"}
					value={value ? new Date(value.date_debut) : undefined}
					showLocaleDate={showLocaleDate}
					minDate={minDate}
					maxDate={maxDate}
					format={format}
					onChange={(newValue: Date) => onChange({ ...value, date_debut: toISO(newValue) })}
				/>
			</FieldContainer>

			<FieldContainer fullWidth>
				<Label>Date de fin</Label>
				<DateInput
					name={name + "_fin"}
					value={value?.date_fin ? new Date(value.date_fin) : undefined}
					showLocaleDate={showLocaleDate}
					minDate={value ? new Date(value.date_debut) : minDate}
					maxDate={maxDate}
					format={format}
					onChange={(newValue: Date) => value?.date_debut && onChange({ ...value, date_fin: toISO(newValue) })}
				/>
			</FieldContainer>
		</div>
	)
}

export default DateRangeInput
