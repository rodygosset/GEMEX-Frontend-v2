
import Button from "@components/button";
import { itemTypesPermissions } from "@conf/api/conf";
import { MySession } from "@conf/utility-types";
import { faClockRotateLeft, faFileLines, faPenToSquare, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import styles from "@styles/components/page-templates/view/action-buttons.module.scss"
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router"
import { useEffect, useState } from "react";


// this component handle the logic 
// to decide which buttons to show the user on the view page
// & the logic for each button

interface Props {
    itemType: string;
}

const ActionButtons = (
    {
        itemType
    }: Props
) => {

    

    const router = useRouter()

    // user privileges
    // impacts which action buttons to show

    const [hasFicheCreationPrivileges, setHasFicheCreationPrivileges] = useState(true)
    const [hasHistoryPrivileges, setHasHistoryPrivileges] = useState(true)
    const [hasItemPrivileges, setHasItemPrivileges] = useState(true)
    const [hasItemDeletionPrivileges, setHasItemDeletionPrivileges] = useState(true)


    // determine which permissions the user has

    const { userRole } = useSession().data as MySession

    useEffect(() => {
        setHasFicheCreationPrivileges(userRole.permissions.includes("fiches"))
        setHasHistoryPrivileges(userRole.permissions.includes("historique"))
        setHasItemPrivileges(userRole.permissions.includes(itemTypesPermissions[itemType]))
        setHasItemDeletionPrivileges(userRole.suppression.includes(itemTypesPermissions[itemType]))
    }, [])
    
    // action buttons handlers

    // create fiche item
    
    const getCreateFicheLink = () => `/create/fiches?itemType=${itemType}&itemId=${router.query.id}`

    const handleCreateFicheClick = () => router.push(getCreateFicheLink())


    // Fiche Systématique History button

    const handleHistoryClick = () => {
        // todo
    }

    // edit current item

    const getEditLink = () => `/edit/${itemType}/${router.query.id}`

    const handleEditClick = () => router.push(getEditLink())

    // delete current item

    const handleDeleteClick = () => {
        // todo
    }

    // logic used to determine which buttons to show

    // only show the Fiche item creation button if:
    // - the user has the privileges to do so
    // - the current item type is a valid one
    //   to use as the subject of a Fiche item

    const ficheItemTypes = [
        "ilots",
        "expositions",
        "elements"
    ]

    const shouldShowFicheCreationButton = () => hasFicheCreationPrivileges && ficheItemTypes.includes(itemType)

    // only show the Fiche Systématique History button if:
    // - the user has the privileges to add to the history of a Fiche Systématique item
    // - the current item type is "fiches_systematiques"

    const shouldShowHistoryButton = () => hasHistoryPrivileges && itemType == "fiches_systematiques"


    // only show the edit button if:
    // - the user has edit privileges on the current item type
    // - the current item type is not "fiches" or "fiches_systematiques"
    // - the current item type is "fiches" &:
    //      - the user is the author, a manager or was assigned the task
    //      - the status is anything but "Validée"
    // - the current item type if "fiches_systematiques" &:
    //      - the user has "systématiques" privileges

    const shouldShowEditButton = () => {
        // todo
        return hasItemPrivileges
    }

    // only show the delete button if:
    // - the user has deletion privileges on the current item type
    // - the current item type is not "fiches"
    // - the current item type is "fiches" &:
    //      - the user is the author & the status is anything but "validée"
    //      - the user is the author & a manager & the status is "validée"

    const shouldShowDeleteButton = () => {
        // todo
        return hasItemDeletionPrivileges
    }

    // render

    return (
        <div id={styles.actionButtons}>
        {
            // determine whether the button should be visible
            shouldShowFicheCreationButton() ?
            <Button
                role="tertiary"
                icon={faFileLines}
                onClick={handleCreateFicheClick}>
                <Link href={getCreateFicheLink()}>
                    Créer une fiche
                </Link>
            </Button>
            :
            <></>
        }
        {
            // determine whether the button should be visible
            shouldShowHistoryButton() ?
            <Button
                role="tertiary"
                icon={faClockRotateLeft}
                status="success"
                onClick={handleHistoryClick}>
                Historique
            </Button>
            :
            <></>
        }
        {
            // determine whether the button should be visible
            shouldShowEditButton() ?
            <Button
                role="tertiary"
                icon={faPenToSquare}
                onClick={handleEditClick}>
                <Link href={getEditLink()}>
                    Modifier
                </Link>
            </Button>
            :
            <></>
        }
        {
            // determine whether the button should be visible
            shouldShowDeleteButton() ?
            <Button
                role="tertiary"
                status="danger"
                icon={faTrashAlt}
                onClick={handleDeleteClick}>
                Supprimer
            </Button>
            :
            <></>
        }
        </div>
    )
}



export default ActionButtons