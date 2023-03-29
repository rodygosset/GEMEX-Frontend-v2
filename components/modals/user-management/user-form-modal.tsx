import { User, UserCreate, UserRole, UserUpdate } from "@conf/api/data-types/user";
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
import CheckBox from "@components/form-elements/checkbox";

interface Props {
    isVisible: boolean;
    closeModal: () => void;
    // if data is undefined, it means we're creating a new user
    data?: User;
    // trigger a refresh on form submission
    refresh: () => void;
}

const UserFormModal = (
    {
        isVisible,
        closeModal,
        data,
        refresh
    }: Props
) => {

    // form data
    
    // if data is defined, load it into the form

    const [firstName, setFirstName] = useState(data?.prenom || "")
    const [lastName, setLastName] = useState(data?.nom || "")

    const [username, setUsername] = useState(data?.username || "")

    const [hashedPassword, setHashedPassword] = useState("")

    const [roleId, setRoleId] = useState<number>(data?.role_id || 0)

    const [selectedRole, setSelectedRole] = useState<UserRole>()

    const [groups, setGroups] = useState<string[]>(data?.groups || [])

    const [isActive, setIsActive] = useState<boolean>(data?.is_active || true)

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

    // make a request to our backend API
    // to create a new user if data is undefined
    // or to update an existing user if data is defined

    const postNewUser = () => {

        // bringing the data together
        const newUser: UserCreate = {
            prenom: firstName,
            nom: lastName,
            username,
            role_id: roleId,
            groups,
            hashed_password: hashedPassword
        }

        
        // code to make the request
        return makeAPIRequest<User, void>(
            "post",
            "users",
            undefined,
            newUser
        )
    }

    const updateUser = () => {
        if(!data) return
        // start with bringing the data together
        // don't include fields that haven't been changed
        // and don't include the password field at all

        const updatedUser: UserUpdate = {
            prenom: firstName !== data.prenom ? firstName : undefined,
            nom: lastName !== data.nom ? lastName : undefined,
            username: username !== data.username ? username : undefined,
            role_id: roleId !== data.role_id ? roleId : undefined,
            groups: groups !== data.groups ? groups : undefined,
            is_active: isActive !== data.is_active ? isActive : undefined
        }

        // make the request
    
        return makeAPIRequest<User, void>(
            "put",
            "users",
            data.username,
            updatedUser
        )
    }

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault()
        // code to make the request
        if(data) await updateUser()
        else await postNewUser()
        closeModal()
        refresh()
    }

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
                {
                    // only show the password field if we're creating a new user
                    !data ?
                    <FieldContainer fullWidth>
                        <Label>Matricule</Label>
                        <TextInput
                            name="password"
                            placeholder="123456"
                            currentValue={hashedPassword}
                            onChange={newVal => setHashedPassword(newVal)}
                            fullWidth
                            bigPadding
                            required
                        />
                    </FieldContainer>
                    :
                    <></>
                }
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
                {
                    // if we're updating an existing user
                    // show the is_active field next to the groups field
                    data ?
                    <div className={styles.row}>
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
                        <FieldContainer>
                            <Label>Actif</Label>
                            <CheckBox
                                value={isActive}
                                onChange={newVal => setIsActive(newVal)}
                            />
                        </FieldContainer>
                    </div>
                    :
                    // otherwise, only show the groups field
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
                }

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