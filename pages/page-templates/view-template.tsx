import Button from "@components/button";
import GoBackButton from "@components/go-back-button";
import HorizontalSeperator from "@components/utils/horizontal-seperator";
import { itemTypes } from "@conf/api/search";
import { faFileLines, faPenToSquare, faTrash, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import styles from "@styles/page-templates/view-template.module.scss"
import { formatItemName } from "@utils/general";
import { cp } from "fs/promises";
import { useRouter } from "next/router";
import { useState } from "react";


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

    const router = useRouter()

    // state


    // user privileges
    // impacts which buttons to show

    const [hasFicheCreationPrivilges, setHasFicheCreationPrivilges] = useState(true)
    const [hasEditPrivilges, setHasEditPrivilges] = useState(true)
    const [hasDeletionPrivilges, setHasDeletionPrivilges] = useState(true)


    // action buttons handlers

    // create fiche item
    
    const getCreateFicheLink = () => `/create/fiches?itemType=${itemType}&itemId=${router.query.id}`

    const handleCreateFicheClick = () => router.push(getCreateFicheLink())

    // edit current item

    const getEditLink = () => `/edit/${itemType}/${router.query.id}`

    const handleEditClick = () => router.push(getEditLink())
    
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
                <div id={styles.actionButtons}>
                {
                    // only show this button 
                    // if the user has creation priviliges on Fiche items
                    hasFicheCreationPrivilges ?
                    <Button
                        role="tertiary"
                        icon={faFileLines}
                        onClick={handleCreateFicheClick}>
                        Créer une fiche
                    </Button>
                    :
                    <></>
                }
                {
                    // only show this button 
                    // if the user has edit priviliges on the current item type
                    hasEditPrivilges ?
                    <Button
                        role="tertiary"
                        icon={faPenToSquare}
                        onClick={handleEditClick}>
                        Modifier
                    </Button>
                    :
                    <></>
                }
                {
                    // only show this button 
                    // if the user has deletion priviliges on the current item type
                    hasDeletionPrivilges ?
                    <Button
                        role="tertiary"
                        status="danger"
                        icon={faTrashAlt}
                        onClick={handleEditClick}>
                        Supprimer
                    </Button>
                    :
                    <></>
                }
                </div>
                <HorizontalSeperator/>
            </section>
            { children }
        </main>
    )
}


export default ViewTemplate