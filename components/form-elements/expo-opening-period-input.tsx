import { faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import styles from "@styles/components/form-elements/expo-opening-period-input.module.scss"
import { useEffect, useState } from "react"
import DateRangeInput from "./date-range-input"
import { APIDateRange } from "@utils/types"
import { Button } from "@components/radix/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Popover, PopoverContent, PopoverTrigger } from "@components/radix/popover"
import { cn } from "@utils/tailwind"

interface FormProps {
	name: string
	value?: APIDateRange
	onSubmit: (value: APIDateRange) => void
}

const OpeningPeriodForm = ({ name, value, onSubmit }: FormProps) => {
	// state

	const [dateRange, setDateRange] = useState(value)

	// effects

	useEffect(() => {
		setDateRange(value)
	}, [value])

	// handlers

	const handleSubmit = () => {
		if (!dateRange) return
		onSubmit(dateRange)
		if (!value) setDateRange(undefined)
	}

	// utils

	const isSubmitActive = () => {
		if (!value) return dateRange !== undefined
		return dateRange !== undefined && (dateRange.date_debut !== value.date_debut || dateRange.date_fin !== value.date_fin)
	}

	// render

	return (
		<div className="flex flex-col items-stretch gap-[16px] rounded-[8px]">
			<span className="text-sm font-medium text-blue-600/60">{value ? "Modifier" : "Ajouter"} une période d'ouverture</span>
			<DateRangeInput
				name={name}
				value={dateRange}
				onChange={setDateRange}
			/>
			<div className="flex justify-between items-center w-full gap-[16px]">
				{value ? (
					<Button
						type="button"
						className="flex-1"
						variant="outline"
						onClick={() => onSubmit(value)}>
						Annuler
					</Button>
				) : (
					<Button
						type="button"
						variant="outline"
						className="flex-1"
						onClick={() => setDateRange(undefined)}
						disabled={!dateRange}>
						Reset
					</Button>
				)}
				<Button
					className="flex-1 flex items-center gap-[8px]"
					type="button"
					onClick={handleSubmit}
					disabled={!isSubmitActive()}>
					<FontAwesomeIcon icon={faEdit} />
					{value ? "Modifier" : "Ajouter"}
				</Button>
			</div>
		</div>
	)
}

interface Props {
	name: string
	value: APIDateRange[]
	onChange: (value: APIDateRange[]) => void
}

const ExpoOpeningPeriodInput = ({ name, value, onChange }: Props) => {
	// state

	const [showPopover, setShowPopover] = useState<boolean>(false)
	const [listItemsPopovers, setListItemsPopovers] = useState<boolean[]>(new Array(value.length).fill(false))

	// effects

	// keep track of the number of items in the list, and update the list of popovers accordingly

	useEffect(() => {
		if (value.length == listItemsPopovers.length) return

		setListItemsPopovers(new Array(value.length).fill(false))
	}, [value.length])

	// render

	return (
		<div className="flex flex-col items-stretch w-full rounded-[8px] border border-blue-600/20">
			{value.length > 0 ? (
				<ul className="w-full flex flex-col items-stretch">
					{value.map((period, i) => (
						<li
							className="flex items-center justify-between gap-[16px] p-[16px] border-b border-blue-600/20 text-sm font-normal text-blue-600/60"
							key={`period-${i}`}>
							{period.date_fin ? (
								<span>
									Du{" "}
									<span className="text-blue-600">
										{new Date(period.date_debut).toLocaleDateString("fr", {
											year: "numeric",
											month: "long",
											day: "numeric"
										})}
									</span>{" "}
									au{" "}
									<span className="text-blue-600">
										{new Date(period.date_fin).toLocaleDateString("fr", {
											year: "numeric",
											month: "long",
											day: "numeric"
										})}
									</span>
								</span>
							) : (
								<span>
									À partir du{" "}
									<span className="text-blue-600">
										{new Date(period.date_debut).toLocaleDateString("fr", {
											year: "numeric",
											month: "long",
											day: "numeric"
										})}
									</span>
								</span>
							)}
							<div className="flex items-center gap-[8px]">
								<Popover>
									<PopoverTrigger asChild>
										<Button
											type="button"
											variant="outline"
											onClick={() => setListItemsPopovers(listItemsPopovers.map((p, j) => (i === j ? !p : p)))}>
											<FontAwesomeIcon icon={faEdit} />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-fit">
										<OpeningPeriodForm
											name={name}
											value={period}
											onSubmit={(newVal) => {
												onChange(value.map((p, j) => (i === j ? newVal : p)))
												setListItemsPopovers(listItemsPopovers.map((p, j) => (i === j ? !p : p)))
											}}
										/>
									</PopoverContent>
								</Popover>
								<Button
									className="text-red-600 border-red-600/20 hover:bg-red-600/10"
									variant="outline"
									onClick={() => onChange(value.filter((p, j) => i !== j))}>
									<FontAwesomeIcon icon={faTrash} />
								</Button>
							</div>
						</li>
					))}
				</ul>
			) : (
				<span className="p-[16px] border-b border-blue-600/20 text-sm font-normal text-blue-600/60">Aucune période d'ouverture</span>
			)}
			<Popover>
				<PopoverTrigger asChild>
					<button
						className={cn(
							"w-full flex items-center gap-[8px] p-[16px]",
							"text-sm font-medium text-blue-600 hover:bg-blue-600/5 transition-all duration-300 ease-in-out cursor-pointer"
						)}
						onClick={() => setShowPopover(!showPopover)}>
						<FontAwesomeIcon icon={faPlus} />
						Ajouter une période
					</button>
				</PopoverTrigger>
				<PopoverContent className="w-fit">
					<OpeningPeriodForm
						name={name}
						onSubmit={(newVal) => {
							onChange([...value, newVal])
							setShowPopover(false)
						}}
					/>
				</PopoverContent>
			</Popover>
		</div>
	)
}

export default ExpoOpeningPeriodInput
