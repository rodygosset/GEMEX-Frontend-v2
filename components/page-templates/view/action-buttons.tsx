
import Button from "@components/button";
import DeleteDialog from "@components/modals/delete-dialog";
import { itemTypesPermissions } from "@conf/api/conf";
import { APPROVED_STATUS_ID, Fiche } from "@conf/api/data-types/fiche";
import { MySession } from "@conf/utility-types";
import { faClockRotateLeft, faFileLines, faHeartBroken, faPenToSquare, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import useAPIRequest from "@hook/useAPIRequest";
import styles from "@styles/page-templates/view/action-buttons.module.scss"
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router"
import { useEffect, useState } from "react";


// this component handles the logic 
// to decide which buttons to show the user on the view page
// & the logic for each button

interface Props {
    itemType: string;
    itemData: any;
}

const ActionButtons = (
    {
        itemType,
        itemData
    }: Props
) => {

    

    const router = useRouter()

    // user privileges
    // impacts which action buttons to show

    const [hasFicheCreationPrivileges, setHasFicheCreationPrivileges] = useState(false)
    const [hasHistoryPrivileges, setHasHistoryPrivileges] = useState(false)
    const [hasItemPrivileges, setHasItemPrivileges] = useState(false)
    const [hasItemDeletionPrivileges, setHasItemDeletionPrivileges] = useState(false)
    const [showActionButtons, setShowActionButtons] = useState(false)

    // determine which permissions the user has

    const session = useSession().data as MySession | null
    const user = session?.user
    const userRole = session?.userRole

    useEffect(() => {
        if(!userRole) return
        setHasFicheCreationPrivileges(userRole.permissions.includes("fiches"))
        setHasHistoryPrivileges(userRole.permissions.includes("historique"))
        setHasItemPrivileges(userRole.permissions.includes(itemTypesPermissions[itemType]))
        setHasItemDeletionPrivileges(userRole.suppression.includes(itemTypesPermissions[itemType]))
    }, [])

    useEffect(() => {
        setShowActionButtons(
            (shouldShowFicheCreationButton() ||
            shouldShowHistoryButton() ||
            shouldShowEditButton() ||
            shouldShowDeleteButton()) ? true : false
        )
    }, [hasFicheCreationPrivileges, 
        hasHistoryPrivileges, 
        hasItemPrivileges,
        hasItemDeletionPrivileges
    ])
    
    // action buttons handlers

    // create fiche item
    
    const getCreateFicheLink = () => `/create/fiches?itemType=${itemType}&itemId=${router.query.id}`

    const handleCreateFicheClick = () => router.push(getCreateFicheLink())

    // Fiche Syst??matique History button

    const handleHistoryClick = () => {
        // todo
    }

    // edit current item

    const getEditLink = () => `/edit/${itemType.replace("_", "/")}/${router.query.id}`

    const handleEditClick = () => router.push(getEditLink())

    // delete current item

    // modal logic

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    
    // show delete dialog

    const handleDeleteClick = () => setShowDeleteModal(true)

    // in case of a "Fiche panne" / malfunction report
    // that hasn't been acknowledged yet
    // mark it as acknowledged by making an API request

    const makeAPIRequest = useAPIRequest()

    const refresh = () => router.push(router.asPath)

    const handleAcknowledgeMalfunctionClick = () => {
        // make a PUT request to the API to remove the "Panne d??clar??e" tag
        // and then refresh the page
        const tags = (itemData as Fiche).tags
        if(tags.includes("Panne d??clar??e")) tags.splice(tags.indexOf("Panne d??clar??e"), 1)
        makeAPIRequest<Fiche, void>(
            "put",
            "fiches",
            itemData.nom,
            {
                tags: tags
            },
            () => refresh()
        )
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

    // only show the Fiche Syst??matique History button if:
    // - the user has the privileges to add to the history of a Fiche Syst??matique item
    // - the current item type is "fiches_systematiques"

    const shouldShowHistoryButton = () => hasHistoryPrivileges && itemType == "fiches_systematiques"


    // only show the edit button if:
    // - the user has edit privileges on the current item type
    // - the current item type is anything but "fiches"
    // -  or the current item type is "fiches" &:
    //      - the user is the author, a manager or was assigned the task
    //      - the status is anything but "Valid??e"

    const userCanEditFicheItem = () => {
        let ficheData = itemData as Fiche
        return (
            user && userRole &&
            (
                userRole.permissions.includes("manage") ||
                ficheData.auteur_id == user.id ||
                ficheData.user_en_charge_id == user.id
            )
        ) && ficheData.status_id != APPROVED_STATUS_ID
    }

    const shouldShowEditButton = () => {
        return (
            hasItemPrivileges && 
            (itemType == "fiches" ? userCanEditFicheItem() : true)
        )
    }

    // only show the delete button if:
    // - the user has deletion privileges on the current item type
    // - the current item type is not "fiches"
    // - the current item type is "fiches" &:
    //      - the user is the author & the status is anything but "valid??e"
    //      - the user is the author & a manager & the status is "valid??e"


    const userCanDeleteFicheItem = () => {
        let ficheData = itemData as Fiche
        return (
            user && userRole &&
            ficheData.auteur_id == user.id &&
            (
                ficheData.status_id != APPROVED_STATUS_ID ||
                userRole.permissions.includes("manage")
            )
        )
    }

    const shouldShowDeleteButton = () => {
        return (
            hasItemDeletionPrivileges || 
            (itemType == "fiches" && userCanDeleteFicheItem())
        )
    }

    // only show the "acknowledge malfunction" button if
    // - the current item is a Fiche object
    // - it has the "Panne d??clar??e" tag (malfunction declared)
    // - the user is a manager

    const shouldShowAcknowledgeButton = () => {
        return (
            userRole &&
            itemType == "fiches" &&
            (itemData as Fiche).tags.includes("Panne d??clar??e") &&
            userRole.permissions.includes("manage")
        )
    }

    // render

    return (
        <>
        {
            showActionButtons ?
            <div id={styles.actionButtons}>
            {
                // determine whether the button should be visible
                shouldShowFicheCreationButton() ?
                <Button
                    role="tertiary"
                    icon={faFileLines}
                    onClick={handleCreateFicheClick}>
                    <Link href={getCreateFicheLink()}>
                        Cr??er une fiche
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
                shouldShowAcknowledgeButton() ?
                <Button
                    role="tertiary"
                    status="danger"
                    icon={faHeartBroken}
                    onClick={handleAcknowledgeMalfunctionClick}>
                    Reconna??tre la panne
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
            {
                // delete dialog
                <DeleteDialog 
                    isVisible={showDeleteModal}
                    closeDialog={() => setShowDeleteModal(false)}
                    itemType={itemType}
                    itemTitle={itemData.nom}
                />
            }
            </div> 
            : 
            <></>
        }
        </>
    )
}



export default ActionButtons