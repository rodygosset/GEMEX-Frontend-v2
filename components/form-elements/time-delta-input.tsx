import styles from "@styles/components/form-elements/time-delta-input.module.scss"
import colors from "@styles/abstracts/_colors.module.scss"
import { SelectOption } from "@utils/react-select/types"
import { TimeDeltaUnit } from "@utils/types"
import { useEffect, useState } from "react"
import { embeddedSelectStyles } from "./date-input"
import { StylesConfig } from "react-select"
import { getDefaultTimeDeltaUnit } from "@utils/form-elements/time-delta-input"
import { secondsInDay, secondsInMonth, secondsInWeek } from "date-fns"
import NumberInput from "@components/radix/number-input"
import { cn } from "@utils/tailwind"
import Combobox from "@components/radix/combobox"

interface Props {
	name: string
	value?: number
	max?: number
	min?: number
	strictComparison?: boolean
	isInErrorState?: boolean
	onChange?: (newValue: number) => void
}

const TimeDeltaInput = ({ name, value, max, min, strictComparison, isInErrorState, onChange }: Props) => {
	// conf

	const unitOptions: SelectOption<TimeDeltaUnit>[] = [
		{ value: "days", label: "Jours" },
		{ value: "weeks", label: "Semaines" },
		{ value: "months", label: "Mois" }
	]

	const defaultUnitOption = unitOptions[0]

	// state & effect

	const [delta, setDelta] = useState(value ? value : 0)

	// notify the parent on update

	useEffect(() => {
		if (onChange) onChange(delta)
	}, [delta])

	// make sure delta is never greated than the provided max value

	useEffect(() => {
		if (!max) return
		if (delta > max) setDelta(max)
	}, [max])

	// nor lesser than the provided min values

	useEffect(() => {
		if (!min) return
		if (delta < min) setDelta(min)
	}, [min])

	// get unit option from unit value

	const getUnitOption = (unitValue: TimeDeltaUnit) => {
		const option = unitOptions.find((option) => option.value == unitValue)
		return option ? option : defaultUnitOption
	}

	// get the most appropriate time unit from time delta value

	const getDefaultUnitOption = (val: typeof value) => {
		return getUnitOption(getDefaultTimeDeltaUnit(val))
	}

	const [unit, setUnit] = useState(getDefaultUnitOption(value))

	// keep delta value consistent between unit changes

	// convert from seconds to TimeDeltaUnit values

	const getValueForUnit = (val: number) => {
		switch (unit.value) {
			case "days":
				val /= secondsInDay
				break
			case "weeks":
				val /= secondsInWeek
				break
			case "months":
				val /= secondsInMonth
				break
			default:
				break
		}
		return Math.round(val)
	}

	const [unitValue, setUnitValue] = useState(getValueForUnit(delta))

	useEffect(() => {
		setUnitValue(getValueForUnit(delta))
	}, [delta, unit])

	// handlers

	const handleChange = (newValue: number) => {
		let newDelta = newValue
		switch (unit.value) {
			case "days":
				newDelta *= secondsInDay
				break
			case "weeks":
				newDelta *= secondsInWeek
				break
			case "months":
				newDelta *= secondsInMonth
				break
			default:
				break
		}
		// make sure we don't set a delta greater than max
		// if(max && newDelta > max) return
		setDelta(newDelta)
	}

	// update the unit option on change

	const handleUnitChange = (newValue: TimeDeltaUnit) => {
		// find the option corresponding to the TimeDelaUnit value
		const unitOption = unitOptions.find((option) => option.value == newValue)
		if (!unitOption) return
		// when found, update the state variable
		setUnit(getUnitOption(newValue))
		handleChange(getValueForUnit(delta))
	}

	// utils

	const getClassNames = () => {
		let classNames = styles.container
		classNames += isInErrorState ? " " + styles.error : ""
		return classNames
	}

	const getMinValueForUnit = () => {
		if (!min) return 1
		const minVal = getValueForUnit(min)
		return strictComparison ? minVal + 1 : minVal
	}

	const getMaxValueForUnit = () => {
		if (!max) return
		const maxVal = getValueForUnit(max)
		return strictComparison ? maxVal - 1 : maxVal
	}

	// render

	return (
		<>
			<input
				type="number"
				value={delta}
				onChange={(event) => handleChange(Number(event.target.value))}
				hidden
			/>
			<div
				className={cn(
					"flex justify-center gap-4 items-center py-[8px] px-4 rounded-[8px] border",
					isInErrorState ? "border-red-600" : "border-blue-600/20",
					"text-sm text-blue-600"
				)}>
				<NumberInput
					value={unitValue}
					onChange={handleChange}
					min={getMinValueForUnit()}
					max={getMaxValueForUnit()}
					embed
				/>
				<div className="h-full w-[1px] bg-blue-600/20">&nbsp;</div>
				<Combobox
					embed
					options={unitOptions}
					onChange={(selectedOption) => handleUnitChange(selectedOption.value as TimeDeltaUnit)}
					selected={unit}
				/>
			</div>
		</>
	)
}

export default TimeDeltaInput
