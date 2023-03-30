import { UserGroup, UserGroupCreate, UserGroupUpdate } from "@conf/api/data-types/user";
import ModalContainer from "../modal-container"
import styles from "@styles/components/modals/user-management/user-form-modal.module.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import FieldContainer from "@components/form-elements/field-container";
import Label from "@components/form-elements/label";
import TextInput from "@components/form-elements/text-input";
import { useEffect, useState } from "react";
import useAPIRequest from "@hook/useAPIRequest";
import Button from "@components/button";

interface Props {
    isVisible: boolean;
    closeModal: () => void;
    data?: UserGroup;
    refresh: () => void;
}

const GroupFormModal = (
    {
        isVisible,
        closeModal,
        data,
        refresh
    }: Props
) => {

    // form data

    const [nom, setNom] = useState(data?.nom || "")

    // if data is defined, load it into the form

    useEffect(() => {
        // if not, reset the form
        if(!data) {
            resetFields()
            return
        }
        setNom(data.nom)
    }, [data])


    // handlers

    const makeAPIRequest = useAPIRequest()

    const postNewGroup = () => {
        // make a request to create a new group

        return makeAPIRequest<UserGroupCreate, UserGroupCreate>(
            "post",
            "groups",
            undefined,
            { nom: nom }
        )
    }

    const updateGroup = () => {
        if(!data) return

        // make a request to update a group

        return makeAPIRequest<UserGroupUpdate, UserGroupUpdate>(
            "put",
            "groups",
            data.nom,
            { new_nom: nom }
        )
    }

    const resetFields = () => setNom("")

    // validate form data

    const [validationError, setValidationError] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>("")


    const validateForm = async () => {
        let validated = true
    
        // default error message

        setErrorMessage("Veuillez préciser le nom du groupe...")

        if(!nom) {
            validated = false
        }

        if(validated) {
            // if we're creating a new group, make sure the nom is unique
            // if we're updating a group, make sure the nom is unique, but not the current one

            const group = await makeAPIRequest<UserGroup, UserGroup | undefined>(
                "get",
                "groups",
                nom,
                undefined,
                res => res.data,
                () => undefined
            )
            // @ts-ignore
            if(group && !data || (data && data.nom !== group.nom)) {
                validated = false
                setErrorMessage("Un rôle avec ce titre existe déjà...")
            }
        }

        return validated
    }

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault()
        if(!(await validateForm())) {
            setValidationError(true)
            return
        }
        if(data) await updateGroup()
        else await postNewGroup()
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
                    <FontAwesomeIcon icon={faUserGroup} />
                    <div className={styles.fieldsContainer}>
                        <div className={styles.nameInputContainer}>
                            <FieldContainer fullWidth>
                                <Label>Nom</Label>
                                <TextInput
                                    name="nom"
                                    className={styles.bigInput}
                                    currentValue={nom}
                                    placeholder="Nom du groupe"
                                    bigPadding
                                    required
                                    fullWidth
                                    isInErrorState={validationError}
                                    onChange={newVal => setNom(newVal)}
                                />
                            </FieldContainer>
                        </div>
                    </div>
                </div>
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

export default GroupFormModal