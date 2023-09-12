import GoBackButton from "@components/go-back-button"
import ActionButtons from "@components/page-templates/view/action-buttons"
import Content from "@components/page-templates/view/content"
import ViewFiles from "@components/page-templates/view/view-files"
import { ScrollArea } from "@components/radix/scroll-area"
import HorizontalSeperator from "@components/utils/horizontal-seperator"
import { Fiche } from "@conf/api/data-types/fiche"
import { itemTypes } from "@conf/api/search"
import styles from "@styles/page-templates/view-template.module.scss"
import { toSingular } from "@utils/general"


interface Props {
    itemType: string;
    itemTitle: string;
    itemData: any;
    extraData?: any;
    hidden?: string[];
}

const ViewTemplate = (
    {
        itemType,
        itemTitle,
        itemData,
        extraData,
        hidden
    }: Props
) => {

    
    // utils

    const getItemTypeLabel = () => {
        const label = itemTypes.find(type => type.value == itemType)?.label.slice(0, -1)
        let itemLabel = itemType?.split('_').length > 1 ? toSingular(itemType) : label || ""
        // account for Fiche items
        // => add the fiche type
        if(itemType?.includes("fiches")) itemLabel = `Fiche ${itemData["tags"][0]}`
        return itemLabel
    } 


    const getClassName = () => {
        if(itemType == "fiches") {
            const ficheData = itemData as Fiche
            // determine which type of Fiche the current one is
            // using the tags attribute
            switch(ficheData.tags[0]) {
                case "Relance":
                    return styles.relance
                case "Panne":
                    return styles.panne
                default:
                    return ""
            }
        } else if(itemType == "fiches_systematiques") {
            return styles.systematique
        }
    }

    const itemTypeHasFiles = () => itemData && "fichiers" in itemData
    
    // render

    return (
        <main id={styles.container}>
            <div className={styles.backButtonContainer}>
                <GoBackButton className={getClassName()}/>
            </div>
            <section>
                <div id={styles.itemTitle} className={getClassName()}>
                    <h1>{itemTitle}</h1>
                    <p>{ getItemTypeLabel() }</p>
                </div>
                <ActionButtons itemType={itemType} itemData={itemData}/>
                <HorizontalSeperator/>
                <ScrollArea className={styles.contentScrollContainer}>
                    <Content 
                        itemType={itemType} 
                        itemData={itemData} 
                        extraData={extraData}
                        hidden={hidden}
                    />
                    {
                        // only render the file cards 
                        // if the current item contains a list of file names
                        itemTypeHasFiles() ?
                        <ViewFiles 
                            itemType={itemType} 
                            itemData={itemData}
                        />
                        :
                        <></>
                    }
                </ScrollArea>
            </section>
        </main>
    )
}


export default ViewTemplate