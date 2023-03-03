import styles from "@styles/page-templates/view/fiche-status.module.scss"
import Button from "@components/button";
import { APPROVED_STATUS_ID, DONE_STATUS_ID, Fiche, INIT_STATUS_ID, REQUEST_STATUS_ID } from "@conf/api/data-types/fiche";
import { MySession } from "@conf/utility-types";
import { useSession } from "next-auth/react";
import { faCheck, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import useAPIRequest from "@hook/useAPIRequest";
import { useRouter } from "next/router";


// this component allows the user to visualize
// & interact with (authorized users only) the status of a Fiche object
// it follows the Fiche lifecycle

interface Props {
    ficheData: Fiche;
    status: {
        label: string;
        id: number;
    };
}

const FicheStatus = (
    {
        ficheData,
        status
    }: Props
) => {

    // lifecycle
    // 1. Demande => can be accepted or closed by a group manager only
    // 2. En cours => can be marked as done ("terminée") 
    //                by the author, the user in charge of the task or a manager
    // 3. Terminée => can be marked as approved ("validée") / invalidated ("en cours") 
    //                by a manager 
    // 4. Validée => status can't be changed

    // determine which permissions the user has

    const session = useSession().data as MySession | null
    const user = session?.user
    const userRole = session?.userRole

    const userIsManager = userRole && userRole.permissions.includes("manage") ? true : false

    // utils

    const getClassName = () => {
        switch(status.id) {
            case REQUEST_STATUS_ID:
                return styles.warning
            case DONE_STATUS_ID:
                return styles.progress
            case APPROVED_STATUS_ID:
                return styles.success
            default:
                return styles.primary
        }
    }

    // whether the user has anything to do with this Fiche object
    // => is he the author, in charge of the work to be done or a manager

    const userIsInvolved = (
        user && userRole &&
        (
            userIsManager ||
            ficheData.auteur_id == user.id ||
            ficheData.user_en_charge_id == user.id
        )
    )

    const shouldAllowAcceptOrClose = () => status.id == REQUEST_STATUS_ID && userIsManager

    const shouldAllowMarkAsInit = () => status.id == DONE_STATUS_ID && userIsInvolved

    const shouldAllowMarkAsDone = () =>  status.id == INIT_STATUS_ID && userIsInvolved

    const shouldAllowMarkAsApproved = () =>  status.id == DONE_STATUS_ID && userIsManager

    // utility function to update the status through an API request

    const makeAPIRequest = useAPIRequest()

    const router = useRouter()

    // reload the page once the status has been updated

    const refresh = () => router.push(router.asPath)

    const updateStatus = (statusId: number) => {
        makeAPIRequest(
            "put",
            "fiches",
            ficheData.nom,
            {
                status_id: statusId
            },
            () => refresh()
        )
    } 

    // action handlers

    const handleAccept = () => updateStatus(INIT_STATUS_ID)

    const handleClose = () => {
        // todo
    }

    const handleMarkAsDone = () => updateStatus(DONE_STATUS_ID)

    const handleMarkAsApproved = () => updateStatus(APPROVED_STATUS_ID)

    // render

    // buttons shown are different depending on the current status

    return (
        <div className={styles.container}>
            <span className={getClassName()}>{status.label}</span>
        {
            shouldAllowAcceptOrClose() ?
            <Button
                icon={faCheck}
                bigBorderRadius
                role="tertiary"
                className={styles.primary}
                onClick={handleAccept}>
                Accepter
            </Button>
            :
            <></>
        }
        {
            shouldAllowAcceptOrClose() ?
            <Button
                icon={faXmark}
                bigBorderRadius
                role="tertiary"
                status="danger"
                className={styles.error}
                onClick={handleClose}>
                Fermer
            </Button>
            :
            <></>
        }
        {
            shouldAllowMarkAsInit() ?
            <Button
                icon={faSpinner}
                bigBorderRadius
                role="tertiary"
                className={styles.primary}
                onClick={handleAccept}>
                Marquer en cours
            </Button>
            :
            <></>
        }
        {
            shouldAllowMarkAsDone() ?
            <Button
                icon={faCheck}
                bigBorderRadius
                role="tertiary"
                status="progress"
                className={styles.progress}
                onClick={handleMarkAsDone}>
                Marquer comme fait
            </Button>
            :
            <></>
        }
        {
            shouldAllowMarkAsApproved() ?
            <Button
                icon={faCheck}
                bigBorderRadius
                role="tertiary"
                status="success"
                className={styles.success}
                onClick={handleMarkAsApproved}>
                Valider
            </Button>
            :
            <></>
        }
        </div>
    )
}

export default FicheStatus