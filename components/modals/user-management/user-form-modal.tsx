import { User, UserRole } from "@conf/api/data-types/user";
import ModalContainer from "../modal-container";
import styles from "@styles/components/modals/user-management/user-form-modal.module.scss"
import Button from "@components/button";
import { faFloppyDisk, faUsers } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import TextInput from "@components/form-elements/text-input";
import { useEffect, useState } from "react";
import { SelectOption } from "@utils/react-select/types";
import Select from "@components/form-elements/select";
import useAPIRequest from "@hook/useAPIRequest";
import { capitalizeFirstLetter } from "@utils/general";
import FieldContainer from "@components/form-elements/field-container";
import Label from "@components/form-elements/label";
import ItemMultiSelect from "@components/form-elements/multi-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
    isVisible: boolean;
    closeModal: () => void;
    data?: User;
}

const UserFormModal = (
    {
        isVisible,
        closeModal,
        data
    }: Props
) => {

    // form data

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")

    const [username, setUsername] = useState("")

    const [roleId, setRoleId] = useState<number>(0)

    const [selectedRole, setSelectedRole] = useState<UserRole>()

    const [groups, setGroups] = useState<string[]>([])

    // role options

    const [roleOptions, setRoleOptions] = useState<SelectOption[]>([])

    // get the list of roles from the API

    const makeAPIRequest = useAPIRequest()

    useEffect(() => {

        makeAPIRequest<UserRole[], void>(
            "get",
            "roles",
            undefined,
            undefined,
            res => setRoleOptions(res.data.map(role => ({ label: capitalizeFirstLetter(role.titre), value: role.id })))
        )

    }, [])

    // dynamically get the info about the selected role

    useEffect(() => {

        if(roleId <= 0) return
        
        makeAPIRequest<UserRole, void>(
            "get",
            "roles",
            `id/${roleId}`,
            undefined,
            res => setSelectedRole(res.data)
        )
    }, [roleId])

    // handlers

    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault()
        closeModal()
    }


    const handleCancellation = () => closeModal

    // render

    return (
        <ModalContainer isVisible={isVisible}>
            <form 
                className={styles.modal + " scroll"}
                name="user-form">
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
                    <div className={styles.fieldsContainer}>
                        <div className={styles.nameInputContainer}>
                            <FieldContainer>
                                <Label>Prénom</Label>
                                <TextInput
                                    name="firstName"
                                    className={styles.bigInput}
                                    currentValue={firstName}
                                    placeholder="Jean"
                                    bigPadding
                                    required
                                    onChange={newVal => setFirstName(newVal)}
                                />
                            </FieldContainer>

                            <FieldContainer>
                                <Label>Nom de famille</Label>
                                <TextInput
                                    name="lastName"
                                    className={styles.bigInput}
                                    currentValue={lastName}
                                    placeholder="Dupont"
                                    bigPadding
                                    required
                                    onChange={newVal => setLastName(newVal)}
                                />
                            </FieldContainer>
                        </div>
                    </div>
                </div>
                <div className={styles.row}>
                    <FieldContainer fullWidth>
                        <Label>Nom d'utilisateur</Label>
                        <TextInput
                            name="username"
                            placeholder="jeandupont"
                            currentValue={username}
                            onChange={newVal => setUsername(newVal)}
                            fullWidth
                            bigPadding
                            required
                        />
                    </FieldContainer>
                    <FieldContainer>
                        <Label>Rôle</Label>
                        <Select
                            name="role"
                            options={roleOptions}
                            value={roleId}
                            required
                            onChange={newVal => setRoleId(newVal)}
                        />
                    </FieldContainer>
                </div>
                <div className={styles.row} style={{ alignItems: "flex-start" }}>
                    <div className={styles.col}>
                        <h4>Permissions</h4>
                        {
                            selectedRole && selectedRole.permissions.length > 0 ?
                            <ul>
                            {
                                selectedRole.permissions.split(',').map((permission, index) => (
                                    <li key={`${permission}_permission_${index}`}>{ capitalizeFirstLetter(permission) }</li>
                                ))
                            }
                            </ul>
                            :
                            // in case the list of permissions is empty
                            selectedRole ?
                            <p>Aucun droit en écriture</p>
                            // in case no role was selected yet
                            :
                            <p>Aucun rôle sélectionné</p>
                        }
                    </div>
                    <div className={styles.col}>
                        <h4>Suppression</h4>
                        {
                            selectedRole && selectedRole.suppression.length > 0 ?
                            <ul>
                            {
                                selectedRole.suppression.split(',').map((permission, index) => (
                                    <li key={`${permission}_delete_permission_${index}`}>{ capitalizeFirstLetter(permission) }</li>
                                ))
                            }
                            </ul>
                            :
                            // in case the list of permissions is empty
                            selectedRole ?
                            <p>Aucun droit en suppression</p>
                            // in case no role was selected yet
                            :
                            <p>Aucun rôle sélectionné</p>
                        }
                    </div>
                </div>
                <FieldContainer fullWidth>
                    <Label><FontAwesomeIcon icon={faUsers}/>&nbsp; Groupes</Label>
                    <ItemMultiSelect
                        name="groupes"
                        itemType="groups"
                        selected={groups}
                        customStyles={{
                            container: base => ({
                                ...base,
                                maxWidth: "540px",
                                width: "100% !important"
                            })
                        }}
                        onChange={newVal => setGroups(newVal)}
                    />
                </FieldContainer>
                <div className={styles.row}>
                    <Button
                        fullWidth
                        role="secondary"
                        onClick={closeModal}>
                        Annuler
                    </Button>
                    <Button
                        icon={faFloppyDisk}
                        fullWidth
                        onClick={handleSubmit}>
                        Sauver
                    </Button>
                </div>
            </form>
        </ModalContainer>

    )
}

export default UserFormModal