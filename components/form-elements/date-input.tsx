import styles from "@styles/components/form-elements/date-input.module.scss"
import colors from "@styles/abstracts/_colors.module.scss"
import DatePicker from "react-datepicker"
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
    onChange: (newValue: Date) => void;
    onFormatChange?: (newFormat: DateFormat) => void;
}


// custom select styles for the format selector

const customSelectStyles: StylesConfig = {
    container: base => ({
        ...base,
        width: "fit-content",
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
        display: "none",
        // padding: "0px 0px 0px 8px",
        // color: colors["primary"],
        // "&:hover": {
        //     color: colors["primary"]
        // }
    }),
    menu: base => ({
        ...base,
        boxShadow: `0px 30px 60px ${colors["primary-200"]}`,
        minWidth: "60px"
    }),
}


const DateInput = (
    {
        name,
        value,
        strict = true,
        format,
        onChange,
        onFormatChange
    }: Props
) => {

    // conf

    const formatOptions: SelectOption<DateFormat>[] = [
        { value: 'yyyy', label: 'Année' },
        { value: 'MM/yyyy', label: 'Mois' },
        { value: 'dd/MM/yyyy', label: 'Date' }
    ]

    // state

    const [date, setDate] = useState(value ? value : new Date())
    
    // keep track of the current date format (only useful when strict mode if off)
    
    // get format option from DateFormat value
    const getFormatOption = (value?: DateFormat) => {
        let option = formatOptions.find(option => option.value == value)
        return option ? option : formatOptions[0]
    }

    // holds the SelectOption for the current format
    // if strict mode is off, load the provided format (if there is one)
    // otherwise, set the format to full date ("dd/MM/yyyy")
    const [dateFormat, setDateFormat] = useState(strict ? formatOptions[2] : getFormatOption(format))

    // update the date value when the format changes

    useEffect(() => onChange(date), [dateFormat])

    // notify parent when local state changes

    useEffect(() => {
        if(onFormatChange) onFormatChange(dateFormat.value)
    }, [dateFormat])

    // update local state when value changes

    useEffect(() => {
        if(!value) return
        setDate(value)
    }, [value])

    useEffect(() => {
        if(!format) return
        setDateFormat(getFormatOption(format))
    }, [format])

    // handlers 

    const handleDateChange = (newValue: Date | null) => {
        // fool-proofing
        if(!newValue) return
        onChange(newValue)
    }
    
    const handleFormatChange = (newValueLabel: string) => {
        const formatOption = formatOptions.find(option => option.value == newValueLabel)
        if(!formatOption) return
        setDateFormat(formatOption)
    }

    // render

    return (
        <>
            <input 
                type="date" 
                value={date ? date.toLocaleDateString() : undefined}
                onChange={event => handleDateChange(new Date(event.target.value))} 
                hidden
            />
            <div className={styles.container}>
                {
                    strict && 
                    <FontAwesomeIcon icon={faCalendar} className={styles.calendarIcon}/>
                }
                <DatePicker
                    selected={date}
                    wrapperClassName={styles.wrapper}
                    onChange={date => handleDateChange(date)}
                    { ...getDatePickerProps(dateFormat) }
                    dateFormat={dateFormat.value}
                    locale={fr}
                    // @ts-ignore
                    customInput={<CustomInput/>}
                />
                {
                    !strict &&
                    <>
                        <div className={styles.seperator}>p</div>
                        <FontAwesomeIcon icon={faCalendar} className={styles.calendarIcon}/>
                        <Select
                            name={name}
                            options={formatOptions}
                            // only enforce value on first load
                            // to avoid needless state updates
                            defaultValue={format}
                            onChange={handleFormatChange}
                            customStyles={customSelectStyles}
                            isSearchable={false}
                        />
                    </>
                }
            </div>
        </>
    )
}

export default DateInput