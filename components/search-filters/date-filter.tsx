import DateInput from "@components/form-elements/date-input"
import { getFilterLabel, SearchFilterProps } from "@conf/api/search"
import { getFormat, toDateObject } from "@utils/form-elements/date-input"
import { DateInputValue } from "@utils/types"
import { useState } from "react"
import FilterWrapper from "./filter-wrapper"
import { toISO } from "@utils/general"


const DateFilter = (
    {
        name,
        filter,
        onChange,
        onToggle
    }: SearchFilterProps
) => {

    const { conf } = filter

    // state & effects

    const [format, setFormat] = useState(getFormat(filter.value, filter.conf.strict))

    // handlers

    const handleChange = (newValue: Date) => {
        if(filter.conf.strict) {
            // directly update the value in the search filters
            // convert the date to ISO string format: yyyy-MM-dd
            onChange(name, toISO(newValue))
            return
        }
        // actually useful code
        // extract values useful for our API search endpoints
        // from the native JS date object
        let dateValue: DateInputValue = {}
        if(format.includes('yyyy')) {
            dateValue.year = newValue.getFullYear()
        }
        if(format.includes('MM')) {
            dateValue.month = newValue.getMonth() + 1
        }
        if(format.includes('dd')) {
            dateValue.day = newValue.getDate()
        }
        // pass the value to the parent
        onChange(name, dateValue)
    }

    // utils

    // as the value for date filters stored in the search filters 
    // is of type DateInputValue
    // we must convert it to a Date object before passing it to the DateInput component
    const getDateValue = () => filter.value ? filter.conf.strict ? new Date(filter.value) :  toDateObject(filter.value) : undefined

    // render

    return (
        <FilterWrapper
            inline
            filterName={name}
            label={getFilterLabel(name, conf)}
            onCheckToggle={onToggle}
            checked={filter.checked}
        >
            <DateInput 
                name={name}
                value={getDateValue()} 
                onChange={handleChange}
                strict={false}
                format={format}
                onFormatChange={setFormat}
            />
        </FilterWrapper>
    )

}

export default DateFilter