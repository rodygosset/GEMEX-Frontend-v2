import styles from "@styles/page-templates/view-template.module.scss"
import { getFilterLabel, searchConf } from "@conf/api/search";
import { Attribute, LinkAttribute, viewableItemTypes } from "@conf/view"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { capitalizeEachWord, dateOptions, toSingular } from "@utils/general";
import { apiURLs } from "@conf/api/conf";
import Link from "next/link";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import CheckBox from "@components/form-elements/checkbox";
import FicheStatus from "./fiche-status";
import { Fiche } from "@conf/api/data-types/fiche";
import FilterCheckBox from "@components/search-filters/filter-checkbox";
import { deltaToString, numberToDelta } from "@utils/form-elements/time-delta-input";

// this component is used in the View page
// to display each item's attribute according to its type

interface Props {
    name: string;
    conf: Attribute;
    data: any;
    itemType: string;
    itemData: any;
}

const ContentItem = (
    {
        name,
        conf,
        data,
        itemType,
        itemData
    }: Props
) => {

    const router = useRouter()

    const fullWidthAttributes = [
        "textArea",
        "itemList",
        "fiches_status"
    ]

    const isFullWidth = fullWidthAttributes.includes(conf.type)
    
    const getContent = () => {
        let textValue = ""
        
        switch(conf.type) {
            case "boolean":
                // unmutable checkbox
                // return <CheckBox value={data} onChange={() => {}}/>
                return <FilterCheckBox value={data} onChange={() => {}} />    
            case "date":
                // display dates in a readable format
                if(data == null) {
                    return <p>Non précisé(e)</p>
                }
                const asDate = new Date(data)
                textValue = capitalizeEachWord(asDate.toLocaleDateString('fr-fr', dateOptions))
                return <p>{textValue}</p>
            case "timeDelta":
                textValue = deltaToString(numberToDelta(data))
                return <p>{textValue}</p>
            case "text":
            case "textArea":
            case "number":
                // if the data is an empty string
                // let the user know it's empty
                // display it as is otherwise
                textValue = typeof data === 'string' && !data ? "Non précisé(e)" : data  
                return <p>{textValue}</p>
            case "link":
                // represents a link to items that refer to this item type
                // aka database models having an attribute like `${itemType}_id`
                const itemLink = `/search?item=${name}&${(conf as LinkAttribute).searchParam}=${router.query.id}`
                return (
                    <ul>
                        <li onClick={() => router.push(itemLink)}>
                            <Link href={itemLink}>{getFilterLabel(name, conf)}</Link>
                        </li>
                    </ul>
                )
            case "fiches_status":
                return <FicheStatus ficheData={itemData as Fiche} status={data}/>
            case "itemList":
                // list of items
                // like tags or categories
                return (
                    <ul>
                    {
                        (data as Array<string>).map((item, index) => {
                            const itemLink = getItemListLink(item)
                            return (
                                <li 
                                    key={`${item}_${index}`}
                                    onClick={() => router.push(itemLink)}>
                                    <Link href={itemLink}>{item}</Link>
                                </li>
                            )
                        })
                    }
                    </ul>
                )
            default:
                if(!(conf.type in apiURLs)) return data
                // in case the data is a link to another item
                // build a link & return it
                return (
                    <p>
                        <FontAwesomeIcon icon={faLink}/>
                        <Link href={getLink()}>{data.label}</Link>
                    </p>
                )
        }
    }

    // utils

    // build a link in case the data is a link to an item

    const getLink = () => {
        if(viewableItemTypes.includes(conf.type)) {
            return `/view/${conf.type}/${data.id}`
        } else {
            return `/search?item=${itemType}&${name}=${data.id}`
        }
    }

    // logic differs for itemList attributes

    const itemTypetoAttributeName = (type: string) => {
        return toSingular(type).toLowerCase().replace(' ', '_') + '_id'
    }

    const getItemListLink = (item: string) => `/search?item=${itemType}&${name}=${item}`

    const getClassNames = () => {
        let classNames = ""
        classNames += isFullWidth ?  styles.isFullWidth : ""
        return classNames
    }

    // render

    if(conf.type in apiURLs && data.label == "Erreur") return <></>

    return (
        <li className={getClassNames()}>
            <div className={styles.itemLabel}>    
                <FontAwesomeIcon icon={conf.icon}/>
                <h5>{getFilterLabel(name, conf)}</h5>
            </div>
            {
                getContent()
            }
        </li>
    )

}

export default ContentItem