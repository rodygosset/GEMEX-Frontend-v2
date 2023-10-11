import GoBackButton from "@components/go-back-button"
import ActionButtons from "@components/page-templates/view/action-buttons"
import Content from "@components/page-templates/view/content"
import ViewFiles from "@components/page-templates/view/view-files"
import { Fiche } from "@conf/api/data-types/fiche"
import { itemTypes } from "@conf/api/search"
import styles from "@styles/page-templates/view-template.module.scss"
import { toSingular } from "@utils/general"
import { cn } from "@utils/tailwind"

interface Props {
	itemType: string
	itemTitle: string
	itemData: any
	extraData?: any
	hidden?: string[]
}

const ViewTemplate = ({ itemType, itemTitle, itemData, extraData, hidden }: Props) => {
	// utils

	const getItemTypeLabel = () => {
		const label = itemTypes.find((type) => type.value == itemType)?.label.slice(0, -1)
		let itemLabel = itemType?.split("_").length > 1 ? toSingular(itemType) : label || ""
		// account for Fiche items
		// => add the fiche type
		if (itemType?.includes("fiches")) itemLabel = `Fiche ${itemData["tags"][0]}`
		return itemLabel
	}

	const itemTypeHasFiles = () => itemData && "fichiers" in itemData

	// render

	return (
		<>
			<div className={cn("w-full flex gap-[32px] sticky top-[80px]", "border-b border-blue-600/10", "bg-neutral-50/40 backdrop-blur-3xl", "px-[2.5vw] py-[16px]")}>
				<GoBackButton />
				<div className="w-full flex flex-wrap gap-[16px] max-sm:flex-col">
					<div className="flex flex-1 flex-col sm:min-w-[350px]">
						<h1
							className={cn(
								"text-xl min-[400px]:text-2xl sm:text-3xl font-semibold text-blue-600",
								itemType == "fiches" && (itemData as Fiche).tags[0] == "Relance" ? "text-yellow-600" : "",
								itemType == "fiches" && (itemData as Fiche).tags[0] == "Panne" ? "text-red-600" : "",
								itemType == "fiches_systematiques" ? "text-emerald-600" : ""
							)}>
							{itemTitle}
						</h1>
						<p
							className={cn(
								"text-sm font-normal text-opacity-60 text-blue-600",
								itemType == "fiches" && (itemData as Fiche).tags[0] == "Relance" ? "text-yellow-600" : "",
								itemType == "fiches" && (itemData as Fiche).tags[0] == "Panne" ? "text-red-600" : "",
								itemType == "fiches_systematiques" ? "text-emerald-600" : ""
							)}>
							{getItemTypeLabel()}
						</p>
					</div>
					<ActionButtons itemType={itemType} itemData={itemData} />
				</div>
			</div>
			<main className="w-full h-full flex-1 flex flex-col gap-16 px-[7%] gap-y-[32px] pt-6">
				<Content itemType={itemType} itemData={itemData} extraData={extraData} hidden={hidden} />
				{
					// only render the file cards
					// if the current item contains a list of file names
					itemTypeHasFiles() ? <ViewFiles itemType={itemType} itemData={itemData} /> : <></>
				}
			</main>
		</>
	)
}

export default ViewTemplate
