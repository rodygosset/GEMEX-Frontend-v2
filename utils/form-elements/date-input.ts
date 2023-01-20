import { SelectOption } from "@utils/react-select/types"
import { DateFormat, DateInputValue } from "@utils/types"

const defaultDateFormat: DateFormat = "yyyy"

// get date picker props depending on the given format

export const getDatePickerProps = (format: SelectOption<DateFormat>) => {
    switch(format.value) {
        case 'yyyy': 
            return { showYearPicker: true }
        case 'MM/yyyy': 
            return { showMonthYearPicker: true }
        case 'dd/MM/yyyy': 
        default:
            return {}
    }
}

// convert DateInputValue object to a native JS Date object

export const toDateObject = (value: DateInputValue) => {
    const { year, month, day } = value

    // can't build a Date object if the year isn't provided
    if(!year) return 
    // in case only the year was provided
    if(!month) return new Date(year, 0, 1)
    // in case only the month & the year were provided
    if(!day) return new Date(year, month -1)
    // in case a complete date was provided
    return new Date(year, month - 1, day)

}

// get format from DateInputValue

export const getFormat = (value: DateInputValue): DateFormat => {
    if(!value) return defaultDateFormat
    const { year, month, day } = value

    // can't determine format if year isn't provided
    // so return the default date format
    if(!year) return defaultDateFormat
    // in case only the year was provided
    if(!month) return "yyyy"
    // in case only the month & the year were provided
    if(!day) return "MM/yyyy"
    // in case a complete date was provided
    return "dd/MM/yyyy"
}