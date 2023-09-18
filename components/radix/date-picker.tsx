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
    fullWidth?: boolean,
    selected?: Date,
    onSelect?: (date?: Date) => void,
    disabled?: Matcher | Matcher[],
}

const DatePicker = (
    {
        fullWidth = false,
        selected,
        onSelect,
        disabled
    }: Props
) => {

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-start text-left font-normal",
            selected ? "capitalize" : "text-primary",
            fullWidth ? "w-full" : "w-[200px]"
          )}
        >
          <FontAwesomeIcon icon={faCalendar} className="mr-[8px] h-[12px] w-[12px]" />
          {selected ? selected.toLocaleDateString("fr-fr", {
            day: "numeric",
            month: "long",
            year: "numeric"
          }) : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContentScroll className="w-auto p-0">
        <Calendar
            locale={fr}
            mode="single"
            selected={selected}
            onSelect={date => onSelect && onSelect(date)}
            disabled={disabled}
            initialFocus
        />
      </PopoverContentScroll>
    </Popover>
  )
}

export { DatePicker }
