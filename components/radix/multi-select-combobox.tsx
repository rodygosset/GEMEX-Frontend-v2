import { SelectOption } from "@utils/react-select/types"
import React, { Fragment, useEffect, useState } from "react"
import { Popover, PopoverContentScroll, PopoverTrigger } from "./popover"
import { cn } from "@utils/tailwind"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons"
import { CommandEmpty, CommandGroup } from "cmdk"
import { Command, CommandInput, CommandItem } from "./command"
import { ScrollArea } from "./scroll-area"

interface Props {
	className?: string
	name?: string
	placeholder?: string
	selected?: SelectOption[]
	options: SelectOption[]
	onSelect: (options: SelectOption[]) => void
}

const MultiSelectCombobox = ({ className, name, placeholder, selected, options, onSelect }: Props, ref: React.ForwardedRef<HTMLDivElement>) => {
	// input ref

	const inputRef = React.useRef<HTMLInputElement>(null)

	// state

	const [inputValue, setInputValue] = useState("")
	const [isOpen, setIsOpen] = useState(false)

	// handlers

	const handleUnselect = (option: SelectOption) => {
		if (!selected) return
		onSelect(selected.filter((o) => o.value != option.value))
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		const input = inputRef.current
		if (!input) return
		if ((e.key == "Delete" || e.key == "Backspace") && input.value == "") {
			if (!selected) return
			onSelect(selected.slice(0, -1))
		}
		// blur on escape
		if (e.key == "Escape") {
			input.blur()
		}
	}

	// render

	return (
		<Popover
			open={isOpen}
			onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<div
					ref={ref}
					className={cn(
						"flex flex-wrap items-center gap-4 min-h-[53px]",
						"px-4 py-[8px] rounded-[8px] border border-blue-600/20",
						"text-sm font-normal text-blue-600/80",
						"ring-offset-primary/10 focus-within:ring-2 focus-within:ring-primary/5 focus-within:ring-offset-2",
						className
					)}>
					{selected ? (
						selected.map((option) => (
							<div
								key={option.value}
								className="flex items-center gap-2 px-4 py-[8px] rounded-[8px] bg-blue-600/10">
								<button
									type="button"
									className="flex items-center justify-center h-[20px] w-[20px]  text-xs text-blue-600 hover:text-error rounded-[4px] bg-transparent hover:bg-error/10 transition-colors duration-300 ease-in-out"
									onClick={() => handleUnselect(option)}>
									<FontAwesomeIcon icon={faTimes} />
								</button>
								<span className="text-sm text-blue-600">{option.label}</span>
							</div>
						))
					) : (
						<></>
					)}
					<input
						name={name}
						ref={inputRef}
						className={cn("flex-1 bg-transparent outline-none text-sm font-normal text-blue-600/80", "placeholder:text-blue-600/60")}
						onClick={() => setIsOpen(true)}
						onFocus={() => setIsOpen(true)}
						onBlur={() => setIsOpen(false)}
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={placeholder ?? "Sélectionner..."}
					/>
				</div>
			</PopoverTrigger>
			<PopoverContentScroll className="w-[250px] p-0">
				<Command>
					<CommandInput placeholder="Rechercher..." />
					<CommandEmpty>Aucun résultat</CommandEmpty>
					<ScrollArea className='flex max-h-[280px] flex-col gap-4"'>
						<CommandGroup>
							{options
								// filter out options that are already selected
								.filter((option) => !selected?.find((item) => item.value == option.value))
								.map((option) => (
									<Fragment key={option.value}>
										<CommandItem
											className="flex flex-row justify-between items-center"
											onSelect={(currentValue) => {
												const option = options.find((option) => option.label.toLowerCase() == currentValue)
												if (option) {
													if (selected?.find((item) => item.value == option.value)) handleUnselect(option)
													else onSelect([...(selected ?? []), option])
												}
											}}>
											{option.label}
											{selected && selected.find((o) => o.value == option.value) ? (
												<FontAwesomeIcon
													icon={faCheck}
													className="text-blue-600"
												/>
											) : (
												<></>
											)}
										</CommandItem>
									</Fragment>
								))}
						</CommandGroup>
					</ScrollArea>
				</Command>
			</PopoverContentScroll>
		</Popover>
	)
}

export default React.forwardRef(MultiSelectCombobox)
