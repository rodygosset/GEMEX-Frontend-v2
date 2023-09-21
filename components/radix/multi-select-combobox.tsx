

import { SelectOption } from '@utils/react-select/types'
import React, { Fragment, useEffect, useState } from 'react'
import { Popover, PopoverContentScroll, PopoverTrigger } from './popover';
import { cn } from '@utils/tailwind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { CommandEmpty, CommandGroup } from 'cmdk';
import { Command, CommandItem } from './command';
import { ScrollArea } from './scroll-area';

interface Props {
    className?: string;
    placeholder?: string;
    selected?: SelectOption[];
    options: SelectOption[];
    onSelect: (options: SelectOption[]) => void;
}

const MultiSelectCombobox = (
    {
        className,
        placeholder,
        selected,
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

    useEffect(() => {

        console.log("is open ? ", isOpen)

    }, [isOpen])


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
                        "ring-offset-primary/10 focus-within:ring-2 focus-within:ring-primary/5 focus-within:ring-offset-2",
                        className
                    )}>
                    {
                        selected ?
                        selected.map(option => (
                            <div 
                                key={option.value}
                                className="flex items-center gap-2 px-[16px] py-[8px] rounded-[8px] bg-primary/10">
                                <button 
                                    type="button"
                                    className="flex items-center justify-center h-[20px] w-[20px]  text-xs text-primary hover:text-error rounded-[4px] bg-transparent hover:bg-error/10 transition-colors duration-300 ease-in-out"
                                    onClick={() => handleUnselect(option)}>
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                                <span className='text-sm text-primary'>{option.label}</span>
                            </div>
                        ))
                        : <></>
                    }
                    <input 
                        ref={inputRef}
                        className={cn(
                            "flex-1 bg-transparent outline-none text-sm font-normal text-primary/80",
                            "placeholder:text-primary/60",
                        )}
                        onFocus={() => setIsOpen(true)}
                        onBlur={() => setIsOpen(false)}
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder ?? "Sélectionner..."}
                    />
                </div>
            </PopoverTrigger>
            <PopoverContentScroll className='w-[250px] p-0'>
                <Command>
                    <ScrollArea className='flex max-h-[280px] flex-col gap-4"'>
                        <CommandEmpty>
                            Aucun résultat
                        </CommandEmpty>
                        <CommandGroup>
                            {
                                options.map(option => (
                                    <Fragment key={option.value}>
                                        <CommandItem
                                            className="flex flex-row justify-between items-center"
                                            onSelect={currentValue => {
                                                const option = options.find(option => option.label.toLowerCase() == currentValue)
                                                if(option) {
                                                    setIsOpen(false)
                                                    onSelect([...options, option])
                                                }
                                            }}
                                        >
                                            {option.label}
                                            {
                                                selected && selected.find(o => o.value == option.value) ?
                                                <FontAwesomeIcon icon={faCheck} className="text-primary" />
                                                : <></>
                                            }
                                        </CommandItem>
                                    </Fragment>
                                ))
                            }
                        </CommandGroup>
                    </ScrollArea>
                </Command>
            </PopoverContentScroll>
        </Popover>
    )
}

export default React.forwardRef(MultiSelectCombobox)