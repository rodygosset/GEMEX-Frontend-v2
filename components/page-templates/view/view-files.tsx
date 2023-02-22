import styles from "@styles/page-templates/view-template.module.scss"
import { Fichier } from "@conf/api/data-types/fichier";
import { useEffect, useState } from "react";
import FileCard from "@components/cards/file-card";
import useAPIRequest from "@hook/useAPIRequest";
import { itemTypetoAttributeName } from "@utils/general";


interface Props {
    itemType: string;
    itemData: any;
}

const ViewFiles = (
    {
        itemType,
        itemData
    }: Props
) => {

    // state

    const [fichiers, setFichiers] = useState<Fichier[]>([])

    // get all the files associated to the current item
    // by making a request to our backend API

    const makeAPIRequest = useAPIRequest()

    const getFiles = () => {
        makeAPIRequest<Fichier[], void>(
            "post",
            "fichiers",
            "search/",
            {
                // compute the name of the search param using the item type
                [itemTypetoAttributeName(itemType)]: itemData.id
            },
            res => setFichiers(res.data)
        )
    }

    useEffect(() => getFiles(), [itemType, itemData])


    // render

    return (
        <div className={styles.fileCardsContainer}>
            <h4>Fichiers</h4>
            <ul>
            {
                fichiers.map(fileName => { 
                    return <FileCard file={fileName}/>
                })
            }
            </ul>
        </div>
    )
}

export default ViewFiles