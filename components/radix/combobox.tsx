import { Fragment, useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./command"
import { Popover, PopoverContentScroll, PopoverTrigger } from "./popover"
import { ScrollArea } from "./scroll-area"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons"
import { SelectOption } from "@utils/react-select/types"
import { cn } from "@utils/tailwind"


interface Props {
    className?: string;
    options: SelectOption[];
    selected?: SelectOption;
    onChange: (value: SelectOption) => void;
}

const Combobox = (
    {
        className,
        options,
        selected,
        onChange
    }: Props
) => {


    const [isOpen, setIsOpen] = useState(false)


    // render

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button 
                    role="combobox"
                    className={cn(
                        `flex flex-row justify-between items-center gap-4 px-[16px] py-[8px] rounded-[8px] w-full
                    text-left overflow-hidden overflow-ellipsis border border-blue-600/20
                   text-sm ${!selected ? "text-blue-600/60" : "text-blue-600"} `,
                        className
                   )}>
                {
                    selected ? 
                    selected.label
                    : "Sélectionner..."
                }
                <FontAwesomeIcon icon={faChevronDown} className="text-blue-600" />
                </button>
            </PopoverTrigger>
            <PopoverContentScroll className="w-[250px] p-0">
                <Command>
                    <CommandInput placeholder="Rechercher..." />
                    <ScrollArea className="flex max-h-[280px] flex-col gap-4">
                        <CommandEmpty>
                            Aucun résultat
                        </CommandEmpty>
                        <CommandGroup>
                            {
                                options.map((option) => (
                                    <Fragment key={option.value}>
                                        <CommandItem 
                                            className="flex flex-row justify-between items-center"
                                            onSelect={currentValue => {
                                                const option = options.find(option => option.label.toLowerCase() == currentValue)
                                                if(option) {
                                                    setIsOpen(false)
                                                    onChange(option)
                                                }
                                            }}
                                        >
                                            {option.label}
                                            {
                                                (selected && option.value == selected.value && selected.value != 0) ?
                                                <FontAwesomeIcon icon={faCheck} className="text-blue-600" />
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

export default Combobox