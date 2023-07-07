import styles from "@styles/page-templates/view-template.module.scss"
import { Fichier } from "@conf/api/data-types/fichier";
import { useEffect, useState } from "react";
import FileCard from "@components/cards/file-card";
import useAPIRequest from "@hook/useAPIRequest";
import { itemTypetoAttributeName } from "@utils/general";
import { MySession } from "@conf/utility-types";
import { useSession } from "next-auth/react";


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

    const session = useSession().data as MySession | null

    const getFiles = () => {
        if (!session) return

        makeAPIRequest<Fichier[], void>(
            session,
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
            {
                fichiers.length > 0 ?
                <ul>
                {
                    fichiers.map(file => { 
                        return <FileCard key={file.nom} file={file}/>
                    })
                }
                </ul>
                :
                <p className={styles.noFilesMessage}><i>Aucun fichier n'est associé à cet item</i></p>
            }
        </div>
    )
}

export default ViewFiles