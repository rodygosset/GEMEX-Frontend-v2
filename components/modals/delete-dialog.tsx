import Button from "@components/button";
import useAPIRequest from "@hook/useAPIRequest";
import styles from "@styles/components/modals/delete-dialog.module.scss"
import { Context } from "@utils/context";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import ModalContainer from "./modal-container";
import { MySession } from "@conf/utility-types";
import { useSession } from "next-auth/react";

interface Props {
    isVisible: boolean;
    isMulti?: boolean;
    closeDialog: () => void;
    itemType: string;
    itemTitle: string;
    itemIDList?: string[];
    onSuccess?: () => void;
    goBackOnSuccess?: boolean;
}

const DeleteDialog = (
    {
        isVisible,
        isMulti,
        closeDialog,
        itemType,
        itemTitle,
        itemIDList,
        onSuccess,
        goBackOnSuccess = true
    }: Props
) => {

    // state

    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)

    // on cancel

    const handleNoClick = () => closeDialog()

    // when the user clicks on yes
    // open the confirmation dialog

    const handleYesClick = () => setShowConfirmationDialog(true)


    // if the user cancels when asked to confirm

    const handleCancellation = () => {
        setShowConfirmationDialog(false)
        closeDialog()
    }

    // if the user confirms they intend to delete the item

    const makeAPIRequest = useAPIRequest()

    const { data, status } = useSession()

    const session = (data as MySession | null)

    const makeDeleteRequest = (itemID: string) => {
        if (!session) return
        return makeAPIRequest(
            session,
            "delete",
            itemType,
            `${itemID}`,
            undefined
        )
    }

    const handleDeleteSuccess = () => {
        // on success
        // close both modals
        handleCancellation()
        // if a success handler was provided
        if(onSuccess) onSuccess()
        // go to the previous URL
        if(goBackOnSuccess) goBack()
    }

    const handleDelete = async () => {

        if(isMulti && itemIDList) {
            for(const itemID of itemIDList) {
                await makeDeleteRequest(itemID)
            }
            handleDeleteSuccess()
        }
        else {
            // make a single DELETE request to our API
            makeDeleteRequest(itemTitle)?.then(handleDeleteSuccess)
        }
    }

    // utils

    const { navHistory, setNavHistory } = useContext(Context)

    const router = useRouter()

    const getPreviousRoute = () => {
        // if navHistory is empty
        // go back to the home page
        if(navHistory.length < 2) return '/'
        // otherwise, go back to the last page
        return navHistory[navHistory.length - 2]
    }

    const goBack = () => {
        // clear the nav history of the current route
        // & of the one we're going back to
        setNavHistory(navHistory.slice(0, navHistory.length - 2))
        router.push(getPreviousRoute())
    }


    // render

    return (
        <>
            <ModalContainer isVisible={isVisible && !showConfirmationDialog}>
                <section className={styles.modal}>
                    <h4>Supprimer un item</h4>
                    <p>Êtes-vous sûr(e) de vouloir supprimer <span>{itemTitle}</span> ?</p>
                    <div className={styles.buttonsContainer}>
                        <Button
                            onClick={handleNoClick}
                            role="secondary"
                            animateOnHover={false}
                            fullWidth>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleYesClick}
                            role="primary"
                            status="danger"
                            fullWidth>
                            Supprimer
                        </Button>
                    </div>
                </section>
            </ModalContainer>
            <ModalContainer isVisible={showConfirmationDialog}>
                <section className={styles.modal}>
                    <h4>Confirmation</h4>
                    <p>Confirmez la suppression de <span>{itemTitle}</span></p>
                    <div className={styles.buttonsContainer}>
                        <Button
                            onClick={handleCancellation}
                            role="secondary"
                            animateOnHover={false}
                            fullWidth>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleDelete}
                            role="primary"
                            status="danger"
                            fullWidth>
                            Supprimer
                        </Button>
                    </div>
                </section>
            </ModalContainer>
        </>
    )

}

export default DeleteDialog