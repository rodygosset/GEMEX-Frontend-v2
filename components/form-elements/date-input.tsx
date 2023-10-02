import styles from "@styles/components/form-elements/date-input.module.scss"
import colors from "@styles/abstracts/_colors.module.scss"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { SelectOption } from "@utils/react-select/types"
import { useEffect, useState } from "react"
import { getDatePickerProps } from "@utils/form-elements/date-input"
import { DateFormat } from "@utils/types"
import React from "react"
import { CustomInput } from "./date-input-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCalendar } from "@fortawesome/free-solid-svg-icons"
import { StylesConfig } from "react-select"
import Select from "./select"
import { fr } from "date-fns/locale"
import VerticalSeperator from "@components/utils/vertical-seperator"
import { cn } from "@utils/tailwind"
import Combobox from "@components/radix/combobox"
import { DatePicker } from "@components/radix/date-picker"

// This input is used both by the search form,
// in which case strict is set to false
// & by other forms, which use it in its default mode

interface Props {
    // this prop determines whether the user is allowed to
    // select a single month, year or day
    // or whether they're obliged to select a complete date
    // ==> (DD/MM/YY)
    name: string;
    value?: Date;
    strict?: boolean;
    format?: DateFormat;
    bigPadding?: boolean;
    showLocaleDate?: boolean;
    minDate?: Date;
    maxDate?: Date;
    onChange: (newValue: Date) => void;
    onFormatChange?: (newFormat: DateFormat) => void;
}


// custom select styles for the format selector

export const embeddedSelectStyles: StylesConfig = {
    container: base => ({
        ...base,
        width: "fit-content",
        minWidth: "50px"
    }),
    control: base => ({
        ...base,
        border: "0",
        boxShadow: "none",
        background: "none",
        padding: "0px",
        alignContent: "center",
        margin: "0px",
        height: "fit-content",
        minHeight: "fit-content",
        "&:hover": {
            border: "0",
            boxShadow: "none",
            cursor: "pointer"
        }
    }),
    valueContainer: base => ({
        ...base,
        padding: "0px"
    }),
    indicatorsContainer: base => ({
        ...base,
        width: "fit-content",
        height: "fit-content"
    }),
    dropdownIndicator: base => ({
        ...base,
        display: "none"
    }),
    menu: base => ({
        ...base,
        boxShadow: `0px 30px 60px ${colors["primary-200"]}`,
        minWidth: "60px"
    }),
}


// conf

export const formatOptions: SelectOption<DateFormat>[] = [
    { value: 'yyyy', label: 'Année' },
    { value: 'MM/yyyy', label: 'Mois' },
    { value: 'dd/MM/yyyy', label: 'Date' }
]

// get format option from DateFormat value
export const getFormatOption = (value?: DateFormat) => {
    let option = formatOptions.find(option => option.value == value)
    return option ? option : formatOptions[0]
}


const DateInput = (
    {
        name,
        value,
        strict = true,
        format = "MM/yyyy",
        bigPadding = true,
        showLocaleDate = false,
        minDate,
        maxDate,
        onChange,
        onFormatChange
    }: Props
) => {

    // state

    const [date, setDate] = useState(value ? value : null)
    
    // keep track of the current date format (only useful when strict mode if off)

    // holds the SelectOption for the current format
    // if strict mode is off, load the provided format (if there is one)
    // otherwise, set the format to full date ("dd/MM/yyyy")
    const [dateFormat, setDateFormat] = useState(strict ? formatOptions[2] : getFormatOption(format))

    // update the date value when the format changes

    useEffect(() => { date && onChange(date) }, [dateFormat])

    // notify parent when local state changes

    useEffect(() => {
        if(onFormatChange) onFormatChange(dateFormat.value)
    }, [dateFormat])

    // update local state when value changes

    useEffect(() => {
        // if(!value) return
        setDate(value ? value : null)
    }, [value])

    useEffect(() => {
        if(!format) return
        setDateFormat(getFormatOption(format))
    }, [format])

    // update current date when min date changes

    useEffect(() => {
        if(!value || !minDate) return
        if(value < minDate) handleDateChange(minDate)
    }, [minDate])

    // update current date when max date changes

    useEffect(() => {
        if(!value || !maxDate) return
        if(value > maxDate) handleDateChange(maxDate)
    }, [maxDate])

    // handlers 

    const handleDateChange = (newValue: Date | null) => {
        // fool-proofing
        if(!newValue) return
        onChange(newValue)
    }
    
    const handleFormatChange = (newValue: string) => {
        const formatOption = formatOptions.find(option => option.value == newValue)
        if(!formatOption) return
        setDateFormat(formatOption)
    }

    // utils

    const getClassNames = () => {
        let classNames = styles.container
        classNames += bigPadding ? ' ' + styles.bigPadding : ''
        classNames += showLocaleDate ? ' ' + styles.large : ''
        return classNames
    }

    // render

    return (
        <>
            <input 
                type="date" 
                value={date ? date.toLocaleDateString() : ''}
                onChange={event => handleDateChange(new Date(event.target.value))} 
                hidden
            />
            <div className={cn(
                "flex justify-center items-center gap-[16px] p-[16px] rounded-[8px]",
                "min-w-[200px] border border-blue-600/20"
            )}>
                {
                    strict && 
                    <FontAwesomeIcon icon={faCalendar} className={cn(
                        "text-blue-600 text-sm",
                        showLocaleDate ? "hidden" : "" 
                    )}/>
                }
                {
                    dateFormat.value == "dd/MM/yyyy" ?
                    <DatePicker
                        embed
                        selected={date ? date : undefined}
                        onSelect={date => handleDateChange(date ?? null)}
                    />
                    :
                    <ReactDatePicker
                        selected={date}
                        wrapperClassName={styles.wrapper}
                        onChange={date => handleDateChange(date)}
                        { ...getDatePickerProps(dateFormat) }
                        dateFormat={dateFormat.value}
                        locale={fr}
                        minDate={minDate}
                        maxDate={maxDate}
                        // @ts-ignore
                        customInput={<CustomInput showLocaleDate={showLocaleDate} />}
                    />
                }
                {
                    !strict &&
                    <>
                        <div className="h-full w-[1px] bg-blue-600/20">&nbsp;</div>
                        <Combobox
                            embed
                            options={formatOptions}
                            onChange={selectedOption => handleFormatChange(selectedOption.value as string)}
                            selected={dateFormat}
                        />
                    </>
                }
            </div>
        </>
    )
}

export default DateInput