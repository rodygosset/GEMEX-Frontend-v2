import ModalContainer from "../modal-container"
import styles from "@styles/components/modals/user-management/user-form-modal.module.scss" 
import { permissionList, suppressionList, UserRole, UserRoleCreate, UserRoleUpdate } from "@conf/api/data-types/user";
import { useState } from "react";
import { SelectOption } from "@utils/react-select/types";
import { capitalizeFirstLetter } from "@utils/general";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import FieldContainer from "@components/form-elements/field-container";
import Label from "@components/form-elements/label";
import TextInput from "@components/form-elements/text-input";
import Button from "@components/button";
import Select from "@components/form-elements/select";
import useAPIRequest from "@hook/useAPIRequest";


interface Props {
    isVisible: boolean;
    closeModal: () => void;
    data?: UserRole;
    refresh: () => void;
}


const RoleFormModal = (
    {
        isVisible,
        closeModal,
        data,
        refresh
    }: Props
) => {

    // form data

    // if data is defined, load it into the form

    const [titre, setTitre] = useState(data?.titre || "")
    const [permissions, setPermissions] = useState(data?.permissions.split(",") || [])
    const [suppression, setSuppression] = useState(data?.suppression.split(",") || [])

    // permission options

    const permissionOptions: SelectOption[] = permissionList.map(permission => ({ 
        label: capitalizeFirstLetter(permission), 
        value: permission 
    }))

    // suppression options

    const suppressionOptions: SelectOption[] = suppressionList.map(suppression => ({
        label: capitalizeFirstLetter(suppression),
        value: suppression
    }))

    // handlers

    const makeAPIRequest = useAPIRequest()

    const postNewRole = () => {
        // start with bringing the data together
        const newRole: UserRoleCreate = {
            titre,
            permissions: permissions.join(","),
            suppression: suppression.join(",")
        }

        // make the request to the API
        return makeAPIRequest<UserRoleCreate, UserRole>(
            "post",
            "roles",
            undefined,
            newRole
        )
    }

    const updateRole = () => {
        if(!data) return
        // start with bringing the data together
        const permissionsString = permissions.join(",")
        const suppressionString = suppression.join(",")
        
        const updatedRole: UserRoleUpdate = {
            titre: titre !== data?.titre ? titre : undefined,
            permissions: permissionsString !== data?.permissions ? permissionsString : undefined,
            suppression: suppressionString !== data?.suppression ? suppressionString : undefined
        }
        
        // make the request to the API
        return makeAPIRequest<UserRoleUpdate, UserRole>(
            "put",
            "roles",
            data.titre,
            updatedRole
        )
    }

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault()
        if(data) await updateRole()
        else await postNewRole()
        closeModal()
        refresh()
    }

    // render

    return (
        <ModalContainer isVisible={isVisible}>
            <form 
                className={styles.modal + " scroll"}
                name="role-form">
                <div className={styles.header}>
                    <FontAwesomeIcon icon={faShieldHalved} />
                    <div className={styles.fieldsContainer}>
                        <div className={styles.nameInputContainer}>
                            <FieldContainer fullWidth>
                                <Label>Titre</Label>
                                <TextInput
                                    name="titre"
                                    className={styles.bigInput}
                                    currentValue={titre}
                                    placeholder="Titre du rôle"
                                    bigPadding
                                    required
                                    fullWidth
                                    onChange={newVal => setTitre(newVal)}
                                />
                            </FieldContainer>
                        </div>
                    </div>
                </div>
                <FieldContainer fullWidth>
                    <Label>Permissions</Label>
                    <Select
                        name="permissions"
                        options={permissionOptions}
                        value={permissions}
                        onChange={newVal => setPermissions(newVal)}
                        isMulti
                        large
                    />
                </FieldContainer>
                <FieldContainer fullWidth>
                    <Label>Suppression</Label>
                    <Select
                        name="suppression"
                        options={suppressionOptions}
                        value={suppression}
                        onChange={newVal => setSuppression(newVal)}
                        isMulti
                        large
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

export default RoleFormModal