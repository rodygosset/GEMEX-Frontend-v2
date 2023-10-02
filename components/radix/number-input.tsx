import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "@utils/tailwind";
import { ChangeEvent, KeyboardEventHandler } from "react"


interface Props {
    className?: string;
    value?: number;
    min?: number;
    max?: number;
    onChange: (newValue: number) => void;
}

const NumberInput = (
    {
        className,
        value,
        min,
        max,
        onChange
    }: Props
) => {

    // lifecycle

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
        if(!e.target.value) onChange(min ? min : 0)
        if(!isNumeric(e.target.value)) return
        const newN = Number(e.target.value)
        if(!isInBounds(newN)) return
        onChange(newN)
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
        if(typeof value === "undefined") return
        if(typeof max !== "undefined" && value + 1 > max) return
        onChange(value + 1)
    }


    // don't decrease if we've reached the min value
    const handleDecrease = () => {
        if(typeof value === "undefined") return
        if(typeof min !== "undefined" && value - 1 < min) return
        onChange(value - 1)
    }

    // render

    return (
        <div className="flex items-center rounded-[8px] border border-blue-600/20">
            <button 
                onClick={handleDecrease}
                className={cn(
                    "text-xs w-[32px] h-[32px] text-blue-600 flex justify-center items-center",
                    "hover:bg-blue-600/10 transition-colors duration-300 ease-in-out"
                )}>
                <FontAwesomeIcon icon={faMinus} />
            </button>
            <input
                className={cn(
                    "w-[128px] h-[32px] text-sm font-normal text-blue-600 placeholder:text-blue-600/60",
                    "bg-transparent text-center",
                )}
                placeholder="0"
                min={min}
                max={max}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
            />
            <button
                onClick={handleIncrease} 
                className={cn(
                    "text-xs w-[32px] h-[32px] text-blue-600 flex justify-center items-center",
                    "hover:bg-blue-600/10 transition-colors duration-300 ease-in-out"
                )}>
                <FontAwesomeIcon icon={faPlus} />
            </button>
        </div>
    )
}

export default NumberInput