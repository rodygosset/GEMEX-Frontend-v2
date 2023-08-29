
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/components/form-elements/numeric-field.module.scss"
import { FormFieldProps } from "@utils/types"
import { ChangeEvent, KeyboardEventHandler, useEffect, useState } from "react"


interface Props extends FormFieldProps<number> {
    large?: boolean;
    embedded?: boolean;
    fullWidth?: boolean;
    min?: number;
    max?: number;
}

const NumericField = (
    {
        value,
        large,
        embedded,
        fullWidth,
        min,
        max,
        onChange
    }: Props
) => {

    // state & effects

    const [n, setN] = useState<number>(value)

    // notify the parent when value changes

    useEffect(() => onChange(n), [n])

    // enforce provided value

    useEffect(() => setN(value), [value])

    // handlers

    const isNumeric = (str: string) => {
        if(typeof str != "string") return false
        // @ts-ignore
        return !isNaN(str) && !isNaN(parseFloat(str))
    }

    // check whether the new value for N is inside the provided bounds
    // account for min and / or max being possibly undefined (not provided)

    const isInBounds = (val: number) => {
        // in case ther's no min and no max
        if(typeof min === "undefined" && typeof max === "undefined") return true
        // in case both were provided
        else if(typeof min !== "undefined" && typeof max !== "undefined" && 
                val >= min && val <= max) return true
        // in case one was provided
        else if(typeof min !== "undefined" && typeof max === "undefined" && val >= min) return true
        else if(typeof max !== "undefined" && typeof min === "undefined" && val <= max) return true
        return false
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if(!e.target.value) setN(min ? min : 0)
        if(!isNumeric(e.target.value)) return
        const newN = Number(e.target.value)
        if(!isInBounds(newN)) return
        setN(newN)
    }


    // update N when the up and down keys are pressed

    const handleKeyDown: KeyboardEventHandler = event => {
        switch(event.key) {
            case "ArrowUp":
                handleIncrease()
                break
            case "ArrowDown":
                handleDecrease()
                break
            default:
                break
        }
    }

    // don't increase if we've reached the max value
    const handleIncrease = () => {
        if(typeof max !== "undefined" && n + 1 > max) return
        setN(n + 1)
    }


    // don't decrease if we've reached the min value
    const handleDecrease = () => {
        if(typeof min !== "undefined" && n - 1 < min) return
        setN(n - 1)
    }

    // conf

    const maxSize = 15

    // utils

    const getClassNames = () => {
        let classNames = styles.container
        classNames += large ? ' ' + styles.large : ''
        classNames += fullWidth ? ' ' + styles.fullWidth : ''
        classNames += embedded ? ' ' + styles.embedded : ''
        return classNames
    }

    const getSize = () => {
        if(large) return undefined 
        return Math.min(n.toString().length, maxSize)
    }


    return (
        <div className={getClassNames()}>
            <input 
                type="text" 
                value={value} 
                min={min}
                max={max}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                size={getSize()}
            />
            <div className={styles.controls}>
                <div 
                    className={styles.controlButton}
                    onClick={() => handleIncrease()}>
                    <FontAwesomeIcon icon={faCaretUp} />
                </div>
                <div 
                    className={styles.controlButton}
                    onClick={() => handleDecrease()}>
                    <FontAwesomeIcon icon={faCaretDown} />
                </div>
            </div>
        </div>
    )
}

export default NumericField