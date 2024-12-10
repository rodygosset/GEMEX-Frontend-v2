import DateInput from "@components/form-elements/date-input"
import { getFilterLabel, SearchFilterProps } from "@conf/api/search"
import { getDateRangeFormat, getFormat, toDateObject } from "@utils/form-elements/date-input"
import { DateInputValue } from "@utils/types"
import { useState } from "react"
import FilterWrapper from "./filter-wrapper"
import { z } from "zod"

type DateRange = {
	start: Date
	end: Date
}

const DateRangeFilter = ({ name, filter, onChange, onToggle }: SearchFilterProps) => {
	const { conf } = filter

	// state & effects

	const [format, setFormat] = useState(getDateRangeFormat(filter.value))

	// handlers

	const handleChange = (newValue: Partial<DateRange>) => {
		// actually useful code
		// extract values useful for our API search endpoints
		// from the native JS date object
		let startDateValue: DateInputValue = {}
		let endDateValue: DateInputValue = {}
		if (format.includes("yyyy")) {
			startDateValue.year = newValue.start?.getFullYear()
			endDateValue.year = newValue.end?.getFullYear()
		}
		if (format.includes("MM")) {
			if (newValue.start) startDateValue.month = newValue.start.getMonth() + 1
			if (newValue.end) endDateValue.month = newValue.end.getMonth() + 1
		}
		if (format.includes("dd")) {
			startDateValue.day = newValue.start?.getDate()
			endDateValue.day = newValue.end?.getDate()
		}
		// pass the value to the parent
		onChange(name, { start: startDateValue, end: endDateValue })
	}

	// utils

	// as the value for date filters stored in the search filters
	// is of type DateInputValue
	// we must convert it to a Date object before passing it to the DateInput component
	const getDateRangeValue = () => {
		const dateInputValueSchema = z.object({
			year: z.number().optional(),
			month: z.number().optional(),
			day: z.number().optional()
		})

		const dateRangeInputValueSchema = z.object({
			start: dateInputValueSchema,
			end: dateInputValueSchema
		})
		const parsed = dateRangeInputValueSchema.safeParse(filter.value)
		if (!parsed.success) return undefined
		return {
			start: toDateObject(parsed.data.start),
			end: toDateObject(parsed.data.end)
		}
	}

	const dateRangeValue = getDateRangeValue()

	// render

	return (
		<FilterWrapper
			filterName={name}
			label={getFilterLabel(name, conf)}
			onCheckToggle={onToggle}
			checked={filter.checked}>
			<DateInput
				className="max-sm:w-full"
				name={name}
				value={dateRangeValue?.start}
				onChange={(date) => handleChange({ start: date, end: dateRangeValue?.end })}
				strict={false}
				format={format}
				onFormatChange={setFormat}
				maxDate={dateRangeValue?.end}
			/>
			<DateInput
				className="max-sm:w-full"
				name={name}
				value={dateRangeValue?.end}
				onChange={(date) => handleChange({ start: dateRangeValue?.start, end: date })}
				strict={false}
				format={format}
				onFormatChange={setFormat}
				minDate={dateRangeValue?.start}
			/>
		</FilterWrapper>
	)
}

export default DateRangeFilter
