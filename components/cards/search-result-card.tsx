import { apiURLs } from "@conf/api/conf"
import { getFilterLabel, searchConf, SearchConf, searchItemIcons, SearchResultsMetaData } from "@conf/api/search"
import { viewConf } from "@conf/view"
import { faLink } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/components/cards/search-result-card.module.scss"
import { capitalizeEachWord, capitalizeFirstLetter, dateOptions } from "@utils/general"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { MouseEvent } from "react"

interface Props {
    data: any;
    itemType: keyof SearchConf;
    href?: string;
    globalMetaData: SearchResultsMetaData;
    listView?: boolean;
    isSelected?: boolean;
    areLinksDisabled?: boolean;
    onClick?: () => void;
}

const SearchResultCard = (
    {
        data,
        itemType,
        href,
        globalMetaData,
        listView,
        isSelected,
        areLinksDisabled,
        onClick
    }: Props
) => {


    const router = useRouter()

    // state

    const [metaData, setMetaData] = useState<any[]>([])

    // get the meta-data for the current search result item

    // use the item's search result config to determine which attribues to display
    const searchResultConfig = searchConf[itemType].searchResultFields

    useEffect(() => {
        if(!globalMetaData) return

        let tmp: any[] = []


        // for each attribute / field
        // get the value from the globalMetaData object
        // update local state when done
        searchResultConfig.forEach(field => {
            
            // if the data for this field is null
            // reflect that in the metaData object, so we don't display it
            if(data[field] == null) {
                tmp.push(null)
                return
            }

            const fieldConf = viewConf[itemType][field]

            // format it properly if it's a date value
            if(fieldConf.type == "date") {
                const date = new Date(data[field]).toLocaleDateString('fr-fr', dateOptions)
                tmp.push(capitalizeEachWord(date))
            } else {
                // otherwise, try retrieve the value
                
                // in case something's wrong
                // display the raw value (the ID)
                if(!(fieldConf.type in apiURLs) || !(field in globalMetaData)) {
                    tmp.push(data[field])
                    return
                }

                // when all's well
                // find out where in the array is our value
                const index = globalMetaData[field].ids.indexOf(data[field])
                // save it
                tmp.push(globalMetaData[field].values[index])
            }
        })

        setMetaData([...tmp])

    }, [globalMetaData])

    // handlers

    const handleClick = (event: MouseEvent) => {
        event.stopPropagation()
        if(typeof onClick !== "undefined") {
            onClick()
        } else if(!areLinksDisabled) {
            router.push(getHref())
        }
    }

    const handleLinkClick = (event: MouseEvent) => {
        if(areLinksDisabled) event.preventDefault()
        else event.stopPropagation()
    }


    // utils
    
    const getClassNames = () => {
        let classNames = styles.listItem
        classNames += listView ? ' ' + styles.listView : ''
        classNames += isSelected ? ' ' + styles.selected : ''
        return classNames
    }

    const getItemIcon = () => searchItemIcons[itemType]

    const getItemTitle = () => {
        if("username" in data 
        && "nom" in data 
        && "prenom" in data) {
            return capitalizeFirstLetter(data.prenom) + ' ' + capitalizeFirstLetter(data.nom) 
        }
        if("nom" in data) return data.nom
        if("titre" in data) return data.titre
        return "Item"
    }

    // get the URL that points to the view page for the current item

    const getHref = () => {
        if(href) return href
        const viewItemType = itemType == "fiches_systematiques" ? "fiches/systematiques" : itemType
        return `/view/${viewItemType}/${data.id}`
    }

    // build the URL for each piece of meta-data that is a link

    const getMetaDataLinkHref = (linkItemType: string, id: number) => {
        const viewLinkItemType = linkItemType == "fiches_systematiques" ? "fiches/systematiques" : linkItemType
        return `/view/${viewLinkItemType}/${id}`
    }

    // render

    return (
        <li 
            onClick={e => handleClick(e)}
            className={getClassNames()}>
            <h4>
                <Link href={getHref()} onClick={handleLinkClick}>
                    <FontAwesomeIcon icon={getItemIcon()}/>
                    <span>{ getItemTitle() }</span>
                </Link>
            </h4>
            <ul>
            {
                searchResultConfig.map((field, index) => {
                    // get the conf from viewConf
                    const fieldConf = viewConf[itemType][field]
                    // don't display the meta-data until it's been loaded
                    if(!metaData[index]) return
                    // render
                    return (
                        <li key={`${field}_item_${data.id}`}>
                            <span className={styles.label}>{getFilterLabel(field, fieldConf)}</span>
                            {
                                // if the current piece of meta-data is a link
                                fieldConf.type in apiURLs ?
                                // display it accordingly
                                <Link 
                                    onClick={handleLinkClick}
                                    href={getMetaDataLinkHref(fieldConf.type, data[field])}>
                                    <FontAwesomeIcon icon={faLink}/>
                                    <span className={styles.metaData}>{metaData[index]}</span>
                                </Link>
                                :
                                // otherwise, display it as text
                                <span className={styles.metaData}>{metaData[index]}</span>
                            }
                        </li>
                    )
                })
            }
            </ul>
        </li>
    )

}

export default SearchResultCard