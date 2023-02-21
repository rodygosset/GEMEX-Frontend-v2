
import GoBackButton from "@components/go-back-button"
import ActionButtons from "@components/page-templates/view/action-buttons"
import Content from "@components/page-templates/view/content"
import HorizontalSeperator from "@components/utils/horizontal-seperator"
import VerticalScrollBar from "@components/utils/vertical-scrollbar"
import { itemTypes } from "@conf/api/search"
import styles from "@styles/page-templates/view-template.module.scss"
import { toSingular } from "@utils/general"


interface Props {
    itemType: string;
    itemTitle: string;
    itemData: any;
    extraData?: any;
}

const ViewTemplate = (
    {
        itemType,
        itemTitle,
        itemData,
        extraData
    }: Props
) => {

    
    // utils

    const getItemTypeLabel = () => {
        const label = itemTypes.find(type => type.value == itemType)?.label.slice(0, -1)
        return itemType.split('_').length > 1 ? toSingular(itemType) : label
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
                <ActionButtons itemType={itemType} itemData={itemData}/>
                <HorizontalSeperator/>
                <VerticalScrollBar className={styles.contentScrollContainer}>
                    <Content 
                        itemType={itemType} 
                        itemData={itemData} 
                        extraData={extraData}
                    />
                </VerticalScrollBar>
            </section>
        </main>
    )
}


export default ViewTemplate