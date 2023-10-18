import { Button } from "@components/radix/button"
import ItemComboBox from "@components/radix/item-combobox"
import { Popover, PopoverContent, PopoverTrigger } from "@components/radix/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/radix/tabs"
import { itemTypes } from "@conf/api/search"
import { MySession } from "@conf/utility-types"
import { faChevronDown } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import useAPIRequest from "@hook/useAPIRequest"
import { itemTypetoAttributeName, toSingular } from "@utils/general"
import { cn } from "@utils/tailwind"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface Props {
	currentItemType: string
	value: number
	isInErrorState?: boolean
	onChange: (fieldName: string, value: any) => void
}

const FicheTargetSelect = ({ currentItemType, value, isInErrorState, onChange }: Props) => {
	// state

	const [selectedItemLabel, setSelectedItemLabel] = useState("")

	// get the selected item's label once it's been set
	// by making a request to our API

	const makeAPIRequest = useAPIRequest()

	const session = useSession().data as MySession | null

	const getLabel = async (itemType: string, id: number) => {
		if (!session) return

		return makeAPIRequest<any, string>(session, "get", itemType, `id/${id}`, undefined, (res) => res.data.nom)
	}

	useEffect(() => {
		if (value == null || value == undefined) {
			setSelectedItemLabel("")
			return
		}
		// get the label for the current item
		// & account for errors by making sure we got back a string
		getLabel(currentItemType, value).then((label) => (typeof label == "string" ? setSelectedItemLabel(label) : null))
	}, [value, currentItemType])

	const [open, setOpen] = useState(false)

	// when an item of a specific item type is selected
	// update the corresponding field in the form
	// & clear the other form that have to do with the fiche's target item

	const targetItemTypes = ["expositions", "elements"]

	const [currentTab, setCurrentTab] = useState(targetItemTypes[1])
	const [selectedExpoId, setSelectedExpoId] = useState(0)
	const [selectedElementId, setSelectedElementId] = useState(0)

	const handleSelect = (itemType: string, id: number) => {
		if (!targetItemTypes.includes(itemType)) return
		let attributeName = ""
		for (const targetItemType of targetItemTypes) {
			attributeName = itemTypetoAttributeName(targetItemType)
			// if targetItemType is itemType, set the id
			// otherwise set field to null
			onChange(attributeName, targetItemType == itemType ? id : 0)
		}
	}

	// utils

	const getItemTypeLabel = () => {
		const label = itemTypes.find((type) => type.value == currentItemType)?.label
		return label ? label : ""
	}

	// render

	return (
		<Popover
			open={open}
			onOpenChange={(o) => setOpen(o)}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className={cn(
						"w-full px-[16px] py-[8px] rounded-[8px] flex justify-between items-center",
						"hover:bg-blue-600/10 focus:bg-blue-600/10 focus:outline-none focus:ring-offset-blue-600/60",
						"focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
						isInErrorState ? "border border-red-500" : "border border-blue-600/20"
					)}>
					{selectedItemLabel ? (
						<span className="flex flex-col justify-center items-start">
							<span className="text-base text-blue-600 font-medium">{selectedItemLabel}</span>
							<span className="text-sm text-blue-600/60">{toSingular(getItemTypeLabel())}</span>
						</span>
					) : (
						<span className="text-sm text-blue-600/60">Sélectionner...</span>
					)}
					<FontAwesomeIcon
						icon={faChevronDown}
						className="text-blue-600 text-sm"
					/>
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-fit flex flex-col gap-[16px]">
				<Tabs
					className="w-full flex flex-col gap-[16px] items-start flex-1"
					value={currentTab}
					onValueChange={(v) => setCurrentTab(v)}>
					<TabsList>
						{targetItemTypes.map((itemType) => (
							<TabsTrigger
								key={itemType}
								value={itemType}>
								{toSingular(itemTypes.find((type) => type.value == itemType)?.label as string)}
							</TabsTrigger>
						))}
					</TabsList>
					<TabsContent
						value={targetItemTypes[0]}
						className="w-full h-full flex-1 min-h-0 m-0 flex flex-col gap-[8px]">
						<ItemComboBox
							itemType="expositions"
							selected={selectedExpoId}
							onChange={(id) => setSelectedExpoId(id)}
						/>
						<span className="text-sm text-blue-600/60">Séléctionner l'exposition à associer à la fiche</span>
					</TabsContent>
					<TabsContent
						value={targetItemTypes[1]}
						className="w-full h-full flex-1 min-h-0 m-0 flex flex-col gap-[16px]">
						<div className="flex flex-col gap-[8px]">
							<span className="text-sm text-blue-600">Exposition</span>
							<ItemComboBox
								itemType="expositions"
								selected={selectedExpoId}
								onChange={(id) => setSelectedExpoId(id)}
							/>
							<span className="text-sm text-blue-600/60">Filtrer les éléments par exposition</span>
						</div>
						<div className="flex flex-col gap-[8px]">
							<span className="text-sm text-blue-600">Élément</span>
							<ItemComboBox
								itemType="elements"
								disabled={!selectedExpoId}
								searchParams={{ exposition_id: selectedExpoId }}
								selected={selectedElementId}
								onChange={(id) => setSelectedElementId(id)}
							/>
							<span className="text-sm text-blue-600/60">Séléctionner l'élément à associer à la fiche</span>
						</div>
					</TabsContent>
				</Tabs>
				<div className="w-full flex gap-[8px] items-center">
					<Button
						className="flex-1"
						onClick={() => setOpen(false)}
						variant="outline">
						Fermer
					</Button>
					<Button
						className="flex-1"
						onClick={() => {
							handleSelect(currentTab, currentTab == "expositions" ? selectedExpoId : selectedElementId)
							setOpen(false)
						}}>
						Séléctionner
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	)
}

export default FicheTargetSelect
