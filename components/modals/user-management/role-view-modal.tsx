import { UserRole } from "@conf/api/data-types/user"
import { UserManagementViewModalProps } from "@utils/types"
import ModalContainer from "../modal-container"
import styles from "@styles/components/modals/user-management/view-modal.module.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPenToSquare, faShieldHalved, faTrash } from "@fortawesome/free-solid-svg-icons"
import { capitalizeFirstLetter } from "@utils/general"
import Button from "@components/button"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { MySession } from "@conf/utility-types"
import DeleteDialog from "../delete-dialog"
import RoleFormModal from "./role-form-modal"

const RoleViewModal = (
    {
        data,
        isVisible,
        closeModal,
        refresh
    }: UserManagementViewModalProps<UserRole>
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
                    <FontAwesomeIcon icon={faShieldHalved}/>
                    <div className={styles.textInfo}>
                        <h2>{ capitalizeFirstLetter(data.titre) }</h2>
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
                <div className={styles.userRoleInfoList}>
                    <div className={styles.col}>
                        <h4>Permissions</h4>
                        {
                            data.permissions.length > 0 ?
                            <ul>
                            {
                                data.permissions.split(',').map((permission, index) => (
                                    <li key={`${permission}_permission_${index}`}>{ capitalizeFirstLetter(permission) }</li>
                                ))
                            }
                            </ul>
                            :
                            // in case the list of permissions is empty
                            <p>Aucun droit en écriture</p>
                        }
                    </div>
                    <div className={styles.col}>
                        <h4>Suppression</h4>
                        {
                            data.suppression.length > 0 ?
                            <ul>
                            {
                                data.suppression.split(',').map((permission, index) => (
                                    <li key={`${permission}_delete_permission_${index}`}>{ capitalizeFirstLetter(permission) }</li>
                                ))
                            }
                            </ul>
                            :
                            // in case the list of permissions is empty
                            <p>Aucun droit en suppression</p>
                        }
                    </div>
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
                itemType="roles"
                itemTitle={data.titre}
                onSuccess={() => {
                    refresh()
                    closeModal()
                }}
            />
            <RoleFormModal
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

export default RoleViewModal