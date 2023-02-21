import styles from "@styles/page-templates/view-template.module.scss"
import { getFilterLabel } from "@conf/api/search";
import { Attribute, viewableItemTypes } from "@conf/view"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { capitalizeEachWord, dateOptions } from "@utils/general";
import { apiURLs } from "@conf/api/conf";
import Link from "next/link";
import { faLink } from "@fortawesome/free-solid-svg-icons";


interface Props {
    name: string;
    conf: Attribute;
    data: any;
    itemType: string;
}

const ContentItem = (
    {
        name,
        conf,
        data,
        itemType
    }: Props
) => {
    
    const getTextValue = () => {
        switch(conf.type) {
            case "date":
                const asDate = new Date(data)
                return capitalizeEachWord(asDate.toLocaleDateString('fr-fr', dateOptions))
            case "text":
            case "textArea":
            case "number":
                // if the data is an empty string
                // let the user know it's empty
                // display it as is otherwise
                return typeof data === 'string' && !data ? "Non précisé(e)" : data  
            default:
                if(!(conf.type in apiURLs)) return data
                // in case the data is a link to another item
                // build a link & return it
                const getLink = () => {
                    if(viewableItemTypes.includes(conf.type)) {
                        return `/view/${conf.type}/${data.id}`
                    } else {
                        return `/search?item=${itemType}&${name}=${data.id}`
                    }
                }
                return (
                    <>
                        <FontAwesomeIcon icon={faLink}/>
                        <Link href={getLink()}>{data.label}</Link>
                    </>
                )
        }
    }

    // render

    return (
        <li>
            <div className={styles.itemLabel}>    
                <FontAwesomeIcon icon={conf.icon}/>
                <h5>{getFilterLabel(name, conf)}</h5>
            </div>
            <p>{getTextValue()}</p>
        </li>
    )

}

export default ContentItem