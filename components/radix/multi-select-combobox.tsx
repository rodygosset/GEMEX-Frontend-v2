

import { SelectOption } from '@utils/react-select/types'
import React, { useState } from 'react'
import { Popover, PopoverTrigger } from './popover';
import { cn } from '@utils/tailwind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface Props {
    className?: string;
    placeholder?: string;
    options: SelectOption[];
    onSelect: (options: SelectOption[]) => void;
}

const MultiSelectCombobox = (
    {
        className,
        placeholder,
        options,
        onSelect
    }: Props,
    ref: React.ForwardedRef<HTMLDivElement>
) => {

    // input ref

    const inputRef = React.useRef<HTMLInputElement>(null)

    // state

    const [inputValue, setInputValue] = useState("")
    const [isOpen, setIsOpen] = useState(false)

    // handlers

    const handleUnselect = React.useCallback((option: SelectOption) => {
        onSelect(options.filter(o => o.value != option.value))
    }, [])


    const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current
        if(!input) return
        if((e.key == "Delete" || e.key == "Backspace") && input.value == "") {
            onSelect(options.slice(0, -1))
        }
        // blur on escape
        if(e.key == "Escape") {
            input.blur()
        }
    }, [])


    // render

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div 
                    ref={ref} 
                    className={cn(
                        "flex items-center gap-4",
                        "px-[16px] py-[8px] rounded-[8px] bg-primary/10",
                        "text-sm font-normal text-primary/80",
                        className
                    )}>
                    {
                        options.map(option => (
                            <div 
                                key={option.value}
                                className="flex items-center gap-4 px-[8px] py-[4px] rounded-[8px] bg-primary/10">
                                <button 
                                    type="button"
                                    className="flex items-center justify-center p-[8px]  text-sm text-primary rounded-[4px] bg-primary/10 hover:bg-primary/20 transition-colors duration-300 ease-in-out"
                                    onClick={() => handleUnselect(option)}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                                <span className='text-sm text-primary'>{option.label}</span>
                            </div>
                        ))
                    }
                    <input 
                        ref={inputRef}
                        className="flex-1 bg-transparent outline-none text-sm font-normal text-primary/80"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder ?? "Sélectionner..."}
                    />
                </div>
            </PopoverTrigger>
        </Popover>
    )
}


// todo 

export default React.forwardRef(MultiSelectCombobox)