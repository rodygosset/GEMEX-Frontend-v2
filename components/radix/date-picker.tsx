"use client"

import { fr } from "date-fns/locale"
import * as React from "react"
import { Popover, PopoverContentScroll, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { cn } from "@utils/tailwind"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCalendar } from "@fortawesome/free-solid-svg-icons"
import { Calendar } from "./calendar"
import { Matcher } from "react-day-picker"

interface Props {
	embed?: boolean
	fullWidth?: boolean
	selected?: Date
	onSelect?: (date?: Date) => void
	disabled?: Matcher | Matcher[]
}

const DatePicker = ({ embed = false, fullWidth = false, selected, onSelect, disabled }: Props) => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"justify-start text-left font-normal",
						"flex items-center gap-[8px]",
						selected ? "capitalize" : "text-blue-600",
						embed ? "text-center justify-center p-0 border-none hover:bg-transparent w-[150px] h-fit" : "",
						fullWidth ? "w-full" : "w-[200px]"
					)}>
					{!embed ? (
						<FontAwesomeIcon
							icon={faCalendar}
							className="h-[12px] w-[12px]"
						/>
					) : (
						<></>
					)}
					{selected ? (
						selected.toLocaleDateString("fr-fr", {
							day: "numeric",
							month: "long",
							year: "numeric"
						})
					) : (
						<span className="text-blue-600/60 w-full text-left">Séléctionner une date...</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContentScroll className="w-auto p-0">
				<Calendar
					locale={fr}
					mode="single"
					selected={selected}
					onSelect={(date) => onSelect && onSelect(date)}
					disabled={disabled}
					initialFocus
				/>
			</PopoverContentScroll>
		</Popover>
	)
}

export { DatePicker }
