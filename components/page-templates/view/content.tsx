import { viewConf } from "@conf/view"
import styles from "@styles/page-templates/view-template.module.scss"
import { useEffect, useState } from "react"
import ContentItem from "./content-item"

interface Props {
    itemType: string;
    itemData: any;
    extraData?: any;
    hidden?: string[];
}

// the goal of this component is to generate a list
// from a database item's data
// it uses the view conf to determine how to display each item
// & in which order

const Content = (
    {
        itemType,
        itemData,
        extraData,
        hidden
    }: Props
) => {

    const hiddenAttributes = [
        "nom",
        "username",
        "titre",
        "fichiers"
    ]

    // the content is displayed in two columns / lists

    const [firstColumnItems, setFirstColumnItems] = useState<string[]>([])
    const [secondColumnItems, setSecondColumnItems] = useState<string[]>([])


    // divide the item's attribute between the two columns

    useEffect(() => {
        const attributes = Object.keys(viewConf[itemType])
        .filter(attr => !hiddenAttributes.includes(attr))
        .filter(attr => hidden ? !hidden.includes(attr) : true)
        const middle = Math.floor(attributes.length / 2)
        setFirstColumnItems(attributes.slice(0, middle))
        setSecondColumnItems(attributes.slice(middle))
    }, [itemData])

    // render the list of attributes into a list of HTMLLIElements
    // this logic was exported into a function because DRY

    const renderList = (contentItemList: string[]) => {
        return contentItemList.map(attributeName => {
            // in case the data for the current attribute
            // is stored in the extraData object
            // build a link object so that the content item component
            // can render it accordingly
            const getData = () => {
                const extraAttrName = attributeName.replace('_id', '')
                if(attributeName.includes('_id') && extraData
                && Object.keys(extraData).includes(extraAttrName)) {
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
                />
            )
        })
    }

    // render

    return (
        <div className="mt-[16px] w-full flex gap-x-[32px] max-md:flex-col">
            <ul className="flex flex-col gap-[16px] flex-1">
            {
                renderList(firstColumnItems)
            }
            </ul>
            <ul className="flex flex-col gap-[16px] flex-1">
            {
                renderList(secondColumnItems)
            }
            </ul>
        </div>
    )
}

export default Content