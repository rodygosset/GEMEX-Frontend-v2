
import GoBackButton from "@components/go-back-button"
import ActionButtons from "@components/page-templates/view/action-buttons"
import HorizontalSeperator from "@components/utils/horizontal-seperator"
import { itemTypes } from "@conf/api/search"
import styles from "@styles/page-templates/view-template.module.scss"
import { formatItemName } from "@utils/general"


interface Props {
    children: any;
    itemType: string;
    itemTitle: string;
}

const ViewTemplate = (
    {
        children,
        itemType,
        itemTitle
    }: Props
) => {

    // state


    
    // utils

    const getItemTypeLabel = () => {
        const label = itemTypes.find(type => type.value == itemType)?.label.slice(0, -1)
        return label|| formatItemName(itemType)
    } 

    // render

    return (
        <main id={styles.container}>
            <div className={styles.backButtonContainer}>
                <GoBackButton/>
            </div>
            <section>
                <div id={styles.itemTitle}>
                    <h1>{itemTitle}</h1>
                    <p>{ getItemTypeLabel() }</p>
                </div>
                <ActionButtons itemType={itemType}/>
                <HorizontalSeperator/>
            </section>
            { children }
        </main>
    )
}


export default ViewTemplate