import { viewConf } from "@conf/view"
import { useEffect, useState } from "react"
import ContentItem from "./content-item"

interface Props {
	itemType: string
	itemData: any
	extraData?: any
	hidden?: string[]
	userIsInGroup?: boolean
}

// the goal of this component is to generate a list
// from a database item's data
// it uses the view conf to determine how to display each item
// & in which order

const Content = ({ itemType, itemData, extraData, hidden, userIsInGroup }: Props) => {
	const hiddenAttributes = ["nom", "username", "titre", "fichiers"]

	// the content is displayed in two columns / lists

	const [firstColumnItems, setFirstColumnItems] = useState<string[]>([])
	const [secondColumnItems, setSecondColumnItems] = useState<string[]>([])

	// divide the item's attribute between the two columns

	useEffect(() => {
		const attributes = Object.keys(viewConf[itemType])
			.filter((attr) => !hiddenAttributes.includes(attr))
			.filter((attr) => (hidden ? !hidden.includes(attr) : true))
		const middle = Math.floor(attributes.length / 2)
		setFirstColumnItems(attributes.slice(0, middle))
		setSecondColumnItems(attributes.slice(middle))
	}, [itemData])

	// render the list of attributes into a list of HTMLLIElements
	// this logic was exported into a function because DRY

	const renderList = (contentItemList: string[]) => {
		return contentItemList.map((attributeName) => {
			// in case the data for the current attribute
			// is stored in the extraData object
			// build a link object so that the content item component
			// can render it accordingly
			const getData = () => {
				const extraAttrName = attributeName.replace("_id", "")
				if (attributeName.includes("_id") && extraData && Object.keys(extraData).includes(extraAttrName)) {
					return {
						label: extraData[extraAttrName],
						id: itemData[attributeName]
					}
				} else {
					return itemData[attributeName]
				}
			}

			return (
				<ContentItem
					key={attributeName}
					name={attributeName}
					conf={viewConf[itemType][attributeName]}
					data={getData()}
					itemType={itemType}
					itemData={itemData}
					userIsInGroup={userIsInGroup}
				/>
			)
		})
	}

	// render

	return (
		<div className="mt-4 w-full flex flex-wrap gap-x-[32px] gap-4 max-md:flex-col">
			<ul className="w-full flex flex-col gap-4 flex-1">{renderList(firstColumnItems)}</ul>
			<ul className="w-full flex flex-col gap-4 flex-1">{renderList(secondColumnItems)}</ul>
		</div>
	)
}

export default Content
