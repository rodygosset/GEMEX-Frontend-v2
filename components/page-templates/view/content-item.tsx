import { getFilterLabel } from "@conf/api/search"
import { Attribute, LinkAttribute, viewableItemTypes } from "@conf/view"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { capitalizeEachWord, dateOptions } from "@utils/general"
import { apiURLs } from "@conf/api/conf"
import Link from "next/link"
import { faLink } from "@fortawesome/free-solid-svg-icons"
import { useRouter } from "next/router"
import FicheStatus from "./fiche-status"
import { Fiche } from "@conf/api/data-types/fiche"
import { deltaToString, numberToDelta } from "@utils/form-elements/time-delta-input"
import ExpoOpeningPeriodsList from "@components/expo-opening-periods-list"
import { cn } from "@utils/tailwind"
import { Switch } from "@components/radix/switch"

// this component is used in the View page
// to display each item's attribute according to its type

interface Props {
	name: string
	conf: Attribute
	data: any
	itemType: string
	itemData: any
	userIsInGroup?: boolean
}

const ContentItem = ({ name, conf, data, itemType, itemData, userIsInGroup }: Props) => {
	const router = useRouter()

	const getContent = () => {
		let textValue = ""

		switch (conf.type) {
			case "boolean":
				// unmutable checkbox
				return (
					<Switch
						disabled
						checked={data}
						onChange={() => {}}
					/>
				)
			case "date":
				// display dates in a readable format
				textValue = data ? capitalizeEachWord(new Date(data).toLocaleDateString("fr-fr", dateOptions)) : "Non précisée"
				return (
					<span
						className={cn(
							"w-full px-4 py-[8px] rounded-[8px] border border-blue-600/20",
							"text-sm font-normal text-blue-600",
							textValue == "Non précisée" ? "text-opacity-80" : ""
						)}>
						{textValue}
					</span>
				)
			case "timeDelta":
				textValue = deltaToString(numberToDelta(data))
				return (
					<span className={cn("w-full px-4 py-[8px] rounded-[8px] border border-blue-600/20", "text-sm font-normal text-blue-600")}>{textValue}</span>
				)
			case "text":
			case "textArea":
			case "number":
				// if the data is an empty string
				// let the user know it's empty
				// display it as is otherwise
				textValue = typeof data === "string" && !data ? "Non précisé(e)" : data
				return conf.type == "number" ? (
					<span
						className={cn(
							"w-full px-4 py-[8px] rounded-[8px] border border-blue-600/20",
							"text-sm font-normal text-blue-600",
							textValue == "Non précisé(e)" ? "text-opacity-80" : ""
						)}>
						{textValue}
					</span>
				) : (
					<pre
						className={cn(
							"text-base whitespace-break-spaces break-words font-normal text-blue-600/80 font-sans p-4 border border-blue-600/20 rounded-[8px]",
							textValue == "Non précisé(e)" ? "text-opacity-80" : ""
						)}>
						{textValue}
					</pre>
				)
			case "link":
				// represents a link to items that refer to this item type
				// aka database models having an attribute like `${itemType}_id`
				const itemLink = `/search?item=${name}&${(conf as LinkAttribute).searchParam}=${router.query.id}`
				return (
					<Link
						className={cn(
							"text-sm text-blue-600 w-fit",
							"px-4 py-[8px] rounded-full border border-blue-600/20",
							"hover:bg-blue-600/10 transition-all duration-300 ease-in-out"
						)}
						href={itemLink}>
						{getFilterLabel(name, conf)}
					</Link>
				)
			case "fiches_status":
				return (
					<FicheStatus
						ficheData={itemData as Fiche}
						status={data}
						userIsInGroup={userIsInGroup}
					/>
				)
			case "expoOpeningPeriod":
				return <ExpoOpeningPeriodsList value={data} />
			case "itemList":
				// list of items
				// like tags or categories
				return (
					<ul className="w-full flex flex-wrap gap-4">
						{(data as Array<string>).map((item, index) => {
							const itemLink = getItemListLink(item)
							return (
								<li key={`${item}_${index}`}>
									<Link
										className={cn(
											"text-sm text-blue-600",
											"px-4 py-[8px] rounded-full border border-blue-600/20",
											"hover:bg-blue-600/10 transition-all duration-300 ease-in-out"
										)}
										href={itemLink}>
										{item}
									</Link>
								</li>
							)
						})}
					</ul>
				)
			default:
				if (!(conf.type in apiURLs)) return data
				// in case the data is a link to another item
				// build a link & return it
				return (
					<span
						className={cn(
							"flex items-center gap-[8px] px-4 py-[8px] rounded-[8px] border border-blue-600/20",
							"text-purple-600 text-sm font-normal",
							"hover:bg-blue-600/10 transition-all duration-300 ease-in-out cursor-pointer"
						)}
						onClick={() => router.push(getLink())}>
						<FontAwesomeIcon icon={faLink} />
						<Link
							className="flex-1"
							href={getLink()}>
							{data.label}
						</Link>
					</span>
				)
		}
	}

	// utils

	// build a link in case the data is a link to an item

	const getLink = () => {
		if (viewableItemTypes.includes(conf.type)) {
			return `/view/${conf.type}/${data.id}`
		} else {
			return `/search?item=${itemType}&${name}=${data.id}`
		}
	}

	// logic differs for itemList attributes

	const getItemListLink = (item: string) => `/search?item=${itemType}&${name}=${item}`

	// render

	if (conf.type in apiURLs && data.label == "Erreur") return <></>

	return (
		<li className="w-full flex flex-col gap-[8px]">
			<span className="text-sm font-medium text-blue-600">{getFilterLabel(name, conf)}</span>
			{getContent()}
		</li>
	)
}

export default ContentItem
