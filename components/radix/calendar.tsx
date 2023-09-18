"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "@utils/tailwind"
import { buttonVariants } from "./button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons"


export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-[12px]", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-[16px] sm:space-x-[16px] sm:space-y-0",
        month: "space-y-[16px] text-primary capitalize",
        caption: "flex justify-center pt-[4px] relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-[4px] flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-[28px] w-[28px] bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-[4px]",
        nav_button_next: "absolute right-[4px]",
        table: "w-full border-collapse space-y-[4px]",
        head_row: "flex",
        head_cell:
          "text-primary/60 rounded-[8px] w-[36px] font-normal text-xs",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-[8px] last:[&:has([aria-selected])]:rounded-r-[8px] focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-[36px] w-[36px] p-0 font-normal aria-selected:opacity-100 text-opacity-80 hover:text-opacity-100"
        ),
        day_selected:
          "bg-primary text-white text-opacity-100 hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-white",
        day_today: "bg-primary/10 text-primary text-opacity-100",
        day_outside: "text-primary/60 opacity-50",
        day_disabled: "text-primary/60 opacity-50",
        day_range_middle:
          "aria-selected:bg-primary/10 aria-selected:text-primary",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <FontAwesomeIcon icon={faChevronLeft} className="h-[8px] w-[8px]" />,
        IconRight: ({ ...props }) => <FontAwesomeIcon icon={faChevronRight} className="h-[8px] w-[8px]" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
