import styles from "@styles/components/form-elements/time-delta-input.module.scss"
import colors from "@styles/abstracts/_colors.module.scss"
import VerticalSeperator from "@components/utils/vertical-seperator";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SelectOption } from "@utils/react-select/types";
import { TimeDeltaUnit } from "@utils/types"
import { useEffect, useState } from "react";
import { embeddedSelectStyles } from "./date-input";
import NumericField from "./numeric-field";
import Select from "./select";
import { StylesConfig } from "react-select";
import { getDefaultTimeDeltaUnit } from "@utils/form-elements/time-delta-input";
import { secondsInDay, secondsInMonth, secondsInWeek } from "date-fns";


interface Props {
    name: string;
    value?: number;
    max?: number;
    min?: number;
    isInErrorState?: boolean;
    onChange?: (newValue: number) => void;
}


const customEmbeddedSelectStyles: StylesConfig = {
    ...embeddedSelectStyles,
    menu: base => ({
        ...base,
        boxShadow: `0px 30px 60px ${colors["primary-200"]}`,
        minWidth: "80px"
    })
}

const TimeDeltaInput = (
    {
        name,
        value,
        max,
        min,
        isInErrorState,
        onChange
    }: Props
) => {

    // conf

    const unitOptions: SelectOption<TimeDeltaUnit>[] = [
        { value: 'days', label: 'Jours' },
        { value: 'weeks', label: 'Semaines' },
        { value: 'months', label: 'Mois' }
    ]

    const defaultUnitOption = unitOptions[0]

    // state & effect

    const [delta, setDelta] = useState(value ? value : 0)

    // notify the parent on update

    useEffect(() => {
        if(onChange) onChange(delta)
    }, [delta])

    // make sure delta is never greated than the provided max value

    useEffect(() => {
        if(!max) return
        if(delta > max) setDelta(max) 
    }, [max])

    // nor lesser than the provided min values

    useEffect(() => {
        if(!min) return
        if(delta < min) setDelta(min) 
    }, [min])

    // get unit option from unit value

    const getUnitOption = (unitValue: TimeDeltaUnit) => {
        const option = unitOptions.find(option => option.value == unitValue)
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
        switch(unit.value) {
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
        switch(unit.value) {
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
        const unitOption = unitOptions.find(option => option.value == newValue)
        if(!unitOption) return
        // when found, update the state variable
        setUnit(getUnitOption(newValue))
        handleChange(getValueForUnit(delta))
    }

    // utils

    const getClassNames = () => {
        let classNames = styles.container
        classNames += isInErrorState ? ' ' + styles.error : ''
        return classNames
    }

    // render

    return (
        <>
            <input 
                type="number" 
                value={delta}
                onChange={event => handleChange(Number(event.target.value))} 
                hidden
            />
            <div className={getClassNames()}>
                <NumericField
                    value={unitValue}
                    onChange={handleChange}
                    min={min ? getValueForUnit(min) : 1}
                    max={max ? getValueForUnit(max) : undefined}
                    embedded
                />
                <VerticalSeperator/>
                <FontAwesomeIcon icon={faClock} className={styles.clockIcon}/>
                <Select
                    name={name}
                    options={unitOptions}
                    // only enforce value on first load
                    // to avoid needless state updates
                    defaultValue={unit.value}
                    onChange={handleUnitChange}
                    customStyles={customEmbeddedSelectStyles}
                    isSearchable={false}
                />
            </div>
        </>
    )
}

export default TimeDeltaInput