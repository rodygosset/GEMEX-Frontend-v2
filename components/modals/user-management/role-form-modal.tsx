import ModalContainer from "../modal-container"
import styles from "@styles/components/modals/user-management/user-form-modal.module.scss" 
import { permissionList, suppressionList, UserRole, UserRoleCreate, UserRoleUpdate } from "@conf/api/data-types/user";
import { useEffect, useState } from "react";
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


    const [titre, setTitre] = useState(data?.titre || "")
    const [permissions, setPermissions] = useState(data?.permissions.split(",") || [])
    const [suppression, setSuppression] = useState(data?.suppression.split(",") || [])

    // if data is defined, load it into the form

    useEffect(() => {
        // if not, reset the form
        if(!data) {
            resetFields()
            return
        }
        setTitre(data.titre)
        setPermissions(data.permissions.split(","))
        setSuppression(data.suppression.split(","))
    }, [data])


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
        return makeAPIRequest<UserRoleCreate, UserRoleCreate>(
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

    const resetFields = () => {
        setTitre("")
        setPermissions([])
        setSuppression([])
        setErrorFields([])
    }

    // validate form data

    const [validationError, setValidationError] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [errorFields, setErrorFields] = useState<string[]>([])

    // make sure no required field is left empty

    const isEmpty = (value: any) => {
        if(typeof value == "string") return !value
        return typeof value == "undefined" || value == null
    }

    const validateForm = async () => {
        let validated = true
        const newErrorFields: string[] = []
    
        // default error message

        setErrorMessage("Veuillez remplir tous les champs requis...")

        if(isEmpty(titre)) {
            validated = false
            newErrorFields.push("titre")
        }

        if(!newErrorFields.includes("titre")) {
            // if we're creating a new role, make sure the title is unique
            // if we're updating a role, make sure the title is unique, but not the current one

            const role = await makeAPIRequest<UserRole, UserRole | undefined>(
                "get",
                "roles",
                titre,
                undefined,
                res => res.data,
                () => undefined
            )
            // @ts-ignore
            if(role && !data || (data && data.titre !== role.titre)) {
                newErrorFields.push("titre")
                validated = false
                setErrorMessage("Un rôle avec ce titre existe déjà...")
            }
        }

        setErrorFields(newErrorFields)

        return validated
    }


    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault()
        if(!(await validateForm())) {
            setValidationError(true)
            return
        }
        if(data) await updateRole()
        else await postNewRole()
        resetFields()
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
                                    isInErrorState={errorFields.includes("titre")}
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
                    />
                </FieldContainer>
                {
                    validationError ?
                    <p className={styles.error}>{ errorMessage }</p>
                    :
                    <></>
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

export default RoleFormModal