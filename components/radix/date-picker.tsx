"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { cn } from "@utils/tailwind"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCalendar } from "@fortawesome/free-solid-svg-icons"
import { Calendar } from "./calendar"


interface Props {
    fullWidth?: boolean,
    selected?: Date,
    onSelect?: (date?: Date) => void
}

const DatePicker = (
    {
        fullWidth = false,
        selected,
        onSelect
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
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={date => onSelect && onSelect(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
