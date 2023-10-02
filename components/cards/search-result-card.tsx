import { apiURLs } from "@conf/api/conf"
import { getFilterLabel, searchConf, SearchConf, searchItemIcons, SearchResultsMetaData } from "@conf/api/search"
import { viewConf } from "@conf/view"
import { faLink } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/components/cards/search-result-card.module.scss"
import { capitalizeEachWord, capitalizeFirstLetter, dateOptions } from "@utils/general"
import { cn } from "@utils/tailwind"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { MouseEvent } from "react"

interface Props {
    data: any;
    itemType: keyof SearchConf;
    href?: string;
    globalMetaData: SearchResultsMetaData;
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
            className={cn(
                "cursor-pointer transition-all duration-200 ease-in-out",
                "w-full flex items-center flex-wrap px-[32px] py-[16px]",
                isSelected ? "bg-blue-600/10 border-2 border-blue-600" : "hover:bg-blue-600/5",
                "max-md:flex-col max-md:items-start gap-[16px]"
            )}>
            <h4 className="text-base text-blue-600 font-medium flex-1 min-w-[200px]">
                <Link 
                    className="flex items-center gap-[8px]"
                    href={getHref()} 
                    onClick={handleLinkClick}>
                    <FontAwesomeIcon icon={getItemIcon()} className="text-2xl" />
                    <span className="flex-1 w-full">{ getItemTitle() }</span>
                </Link>
            </h4>
            <ul className="w-full flex flex-col items-start flex-1 gap-[8px]">
            {
                searchResultConfig.map((field, index) => {
                    // get the conf from viewConf
                    const fieldConf = viewConf[itemType][field]
                    // don't display the meta-data until it's been loaded
                    if(!metaData[index]) return
                    // render
                    return (
                        <li 
                            className="w-full flex flex-wrap items-center gap-[8px]"
                            key={`${field}_item_${data.id}`}>
                            <span className="text-blue-600/80">
                                {getFilterLabel(field, fieldConf)}
                            </span>
                            {
                                // if the current piece of meta-data is a link
                                fieldConf.type in apiURLs ?
                                // display it accordingly
                                <Link 
                                    className={cn(
                                        "flex-1 flex gap-[4px] text-purple-600 hover:text-purple-500 underline cursor-pointer",
                                        "transition-all duration-200 ease-in-out",
                                        "whitespace-nowrap overflow-hidden text-ellipsis"
                                    )}
                                    onClick={handleLinkClick}
                                    href={getMetaDataLinkHref(fieldConf.type, data[field])}>
                                    <FontAwesomeIcon icon={faLink}/>
                                    <span className="w-full whitespace-nowrap overflow-hidden text-ellipsis">{metaData[index]}</span>
                                </Link>
                                :
                                // otherwise, display it as text
                                <span className={cn(
                                    "text-blue-600 flex-1 whitespace-nowrap overflow-hidden text-ellipsis",
                                )}>
                                    {metaData[index]}
                                </span>
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