
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/components/form-elements/numeric-field.module.scss"
import { FormFieldProps } from "@utils/types"
import { ChangeEvent, KeyboardEventHandler, useEffect, useState } from "react"


interface Props extends FormFieldProps<number> {
    large?: boolean;
    embedded?: boolean;
    min?: number;
    max?: number;
}

const NumericField = (
    {
        value,
        large,
        embedded,
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

    // check is the new value for N inside the provided bounds
    // account for min and / or max being possibly undefined (not provided)

    const isInBounds = (val: number) => {
        if(!min && !max) return true
        if(min && max && val >= min && val <= max) return true
        else if(min && val >= min) return true
        else if(max && val <= max) return true
        return false
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if(!e.target.value) setN(0)
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
        if(typeof max != "undefined" && n + 1 > max) return
        setN(n + 1)
    }


    // don't decrease if we've reached the min value
    const handleDecrease = () => {
        if(typeof min != "undefined" && n - 1 < min) return
        setN(n - 1)
    }

    // conf

    const maxSize = 15

    // utils

    const getClassNames = () => {
        let classNames = styles.container
        classNames += large ? ' ' + styles.large : ''
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