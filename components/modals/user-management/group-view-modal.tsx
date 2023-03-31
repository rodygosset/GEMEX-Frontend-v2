import { UserGroup } from "@conf/api/data-types/user"
import { UserManagementViewModalProps } from "@utils/types"
import ModalContainer from "../modal-container"
import styles from "@styles/components/modals/user-management/view-modal.module.scss"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { MySession } from "@conf/utility-types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare, faTrash, faUserGroup } from "@fortawesome/free-solid-svg-icons"
import { capitalizeFirstLetter } from "@utils/general"
import Button from "@components/button"
import DeleteDialog from "../delete-dialog"
import GroupFormModal from "./group-form-modal"

const UserGroupViewModal = (
    {
        data,
        isVisible,
        closeModal,
        refresh
    }: UserManagementViewModalProps<UserGroup>
) => {

    // get current user's role

    const session = useSession()
    const currentUserRole = (session.data as MySession | null)?.userRole

    // manage modals

    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const shouldShowDeleteDialog = () => currentUserRole?.suppression.includes("users") || false

    // don't render if the data is not available

    if(!data) return <></>

    // render

    return (
        <ModalContainer isVisible={isVisible}>
            <section className={styles.modal}>
            <div className={styles.header}>
                    <FontAwesomeIcon icon={faUserGroup}/>
                    <div className={styles.textInfo}>
                        <h2>{ capitalizeFirstLetter(data.nom) }</h2>
                    </div>
                </div>
                <div className={styles.buttonsContainer}>
                    <Button
                        icon={faPenToSquare}
                        role="tertiary"
                        fullWidth
                        onClick={() => setShowEditModal(true)}>
                        Modifier
                    </Button>
                    {
                        shouldShowDeleteDialog() ?
                        <Button
                            icon={faTrash}
                            role="tertiary"
                            status="danger"
                            fullWidth
                            onClick={() => setShowDeleteDialog(true)}>
                            Supprimer
                        </Button>
                        :
                        <></>
                    }
                </div>
                <Button
                    fullWidth
                    role="secondary"
                    onClick={closeModal}>
                    Fermer
                </Button>
            </section>
            <DeleteDialog
                isVisible={showDeleteDialog}
                closeDialog={() => setShowDeleteDialog(false)}
                goBackOnSuccess={false}
                itemType="groups"
                itemTitle={data.nom}
                onSuccess={() => {
                    refresh()
                    closeModal()
                }}
            />
            <GroupFormModal
                isVisible={showEditModal}
                closeModal={() => setShowEditModal(false)}
                refresh={() => {
                    refresh()
                    closeModal()
                }}
                data={data}
            />
        </ModalContainer> 
    )

}

export default UserGroupViewModal
