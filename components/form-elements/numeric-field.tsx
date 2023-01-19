
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/components/form-elements/numeric-field.module.scss"
import { FormFieldProps } from "@utils/types"
import { ChangeEvent, KeyboardEventHandler, useEffect, useState } from "react"


interface Props extends FormFieldProps {
    large?: boolean;
}

const NumericField = (
    {
        value,
        large,
        onChange
    }: Props
) => {

    // state & effects

    const [n, setN] = useState<number>(value)

    // notify the parent when value changes

    useEffect(() => onChange(n), [n])

    // handlers

    const isNumeric = (str: string) => {
        if(typeof str != "string") return false
        // @ts-ignore
        return !isNaN(str) && !isNaN(parseFloat(str))
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if(!e.target.value) setN(0)
        if(!isNumeric(e.target.value)) return
        setN(Number(e.target.value))
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

    const handleIncrease = () => setN(n + 1)

    const handleDecrease = () => setN(n - 1)

    // conf

    const maxSize = 15

    // utils

    const getClassNames = () => {
        let classNames = styles.container
        classNames += large ? ' ' + styles.large : ''
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