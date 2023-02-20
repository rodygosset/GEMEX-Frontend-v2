import styles from "@styles/page-templates/view-template.module.scss"
import { getFilterLabel } from "@conf/api/search";
import { Attribute } from "@conf/view"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { capitalizeEachWord, dateOptions } from "@utils/general";


interface Props {
    name: string;
    conf: Attribute;
    data: any;
}

const ContentItem = (
    {
        name,
        conf,
        data
    }: Props
) => {
    
    const getTextValue = () => {
        switch(conf.type) {
            case "date":
                const asDate = new Date(data)
                return capitalizeEachWord(asDate.toLocaleDateString('fr-fr', dateOptions))
            
            default:
                // if the data is an empty string
                // let the user know it's empty
                // display it as is otherwise
                return typeof data === 'string' && !data ? "Non précisé(e)" : data  
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