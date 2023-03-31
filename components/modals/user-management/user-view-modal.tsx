import { getUserFullName, User, UserRole } from "@conf/api/data-types/user"
import { UserManagementViewModalProps } from "@utils/types"
import ModalContainer from "../modal-container"
import styles from "@styles/components/modals/user-management/view-modal.module.scss"
import Image from "next/image"
import Button from "@components/button"
import { useEffect, useState } from "react"
import { faCircle, faPenToSquare, faPowerOff, faTrash, faUserGroup } from "@fortawesome/free-solid-svg-icons"
import useAPIRequest from "@hook/useAPIRequest"
import { capitalizeFirstLetter } from "@utils/general"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import DeleteDialog from "../delete-dialog"
import UserFormModal from "./user-form-modal"
import { useSession } from "next-auth/react"
import { MySession } from "@conf/utility-types"

const UserViewModal = (
    {
        data,
        isVisible,
        closeModal,
        refresh
    }: UserManagementViewModalProps<User>
) => {

    // get current user's role

    const session = useSession()
    const currentUserRole = (session.data as MySession | null)?.userRole

    // state

    const [role, setRole] = useState<UserRole | undefined>()

    // get the user role from the API

    const makeAPIRequest = useAPIRequest()

    useEffect(() => {
        if(!data) return

        makeAPIRequest<UserRole, void>(
            "get",
            "roles",
            `id/${data.role_id}`,
            undefined,
            res => setRole(res.data)
        )
    }, [data])


    // manage modals

    const [showEditModal, setShowEditModal] = useState(false)

    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const shouldShowDeleteDialog = () => currentUserRole?.suppression.includes("users") || false 

    // handlers

    // when the user clicks on the "mark as active/inactive" button

    const handleUpdateIsActive = () => {
        if(!data) return

        makeAPIRequest<User, void>(
            "put",
            "users",
            data.username,
            {
                is_active: !data.is_active
            },
            () => {
                refresh()
                closeModal()
            }
        )
    }

    // utils

    const getGroups = () => data?.groups.join(", ") || "Aucun"

    // don't render if there is no data or role

    if(!data || !role) return <></>

    // render

    return (
        <ModalContainer isVisible={isVisible}>
            <section className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.illustrationContainer}>
                        <Image 
                            quality={100}
                            src={'/images/male-user-illustration.svg'} 
                            alt={"Utilisateur"} 
                            priority
                            fill
                            style={{ 
                                objectFit: "contain", 
                                top: "auto"
                            }}
                        />
                    </div>
                    <div className={styles.textInfo}>
                        <h2>{ getUserFullName(data) }</h2>
                        <p>@{ data.username }</p>
                        <p className={styles.userRoleInfo}>
                            <span>{ capitalizeFirstLetter(role.titre) }</span>
                            <FontAwesomeIcon icon={faCircle}/>
                            <span>{ data.is_active ? 'Actif' : 'Inactif' }</span>
                        </p>
                    </div>
                </div>
                <div className={styles.buttonsContainer}>
                    <Button
                        icon={faPenToSquare}
                        role="tertiary"
                        fullWidth={!shouldShowDeleteDialog()}
                        onClick={() => setShowEditModal(true)}>
                        Modifier
                    </Button>
                    <Button
                        icon={faPowerOff}
                        role="tertiary"
                        status="progress"
                        fullWidth={!shouldShowDeleteDialog()}
                        onClick={handleUpdateIsActive}>
                        Marquer { data.is_active ? 'inactif' : 'actif' }
                    </Button>
                    {
                        shouldShowDeleteDialog() ?
                        <Button
                            icon={faTrash}
                            role="tertiary"
                            status="danger"
                            onClick={() => setShowDeleteDialog(true)}>
                            Supprimer
                        </Button>
                        :
                        <></>
                    }
                </div>
                <div className={styles.userGroupInfo}>
                    <p className={styles.label}>
                        <FontAwesomeIcon icon={faUserGroup}/>
                        <span>Groupes</span>
                    </p>
                    <p>{ getGroups() }</p>
                </div>
                <div className={styles.userRoleInfoList}>
                    <div className={styles.col}>
                        <h4>Permissions</h4>
                        {
                            role.permissions.length > 0 ?
                            <ul>
                            {
                                role.permissions.split(',').map((permission, index) => (
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
                            role.suppression.length > 0 ?
                            <ul>
                            {
                                role.suppression.split(',').map((permission, index) => (
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
                itemType="users"
                itemTitle={data.username}
                onSuccess={() => {
                    refresh()
                    closeModal()
                }}
            />
            <UserFormModal
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

export default UserViewModal