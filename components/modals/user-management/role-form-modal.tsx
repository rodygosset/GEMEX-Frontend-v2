import ModalContainer from "../modal-container"
import styles from "@styles/components/modals/user-management/form-modal.module.scss"
import { permissionList, suppressionList, UserRole, UserRoleCreate, UserRoleUpdate } from "@conf/api/data-types/user"
import { useEffect, useState } from "react"
import { SelectOption } from "@utils/react-select/types"
import { capitalizeFirstLetter } from "@utils/general"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFloppyDisk, faShieldHalved } from "@fortawesome/free-solid-svg-icons"
import FieldContainer from "@components/form-elements/field-container"
import Label from "@components/form-elements/label"
import TextInput from "@components/form-elements/text-input"
import Button from "@components/button"
import Select from "@components/form-elements/select"
import useAPIRequest from "@hook/useAPIRequest"
import { useSession } from "next-auth/react"
import { MySession } from "@conf/utility-types"
import { isAxiosError } from "axios"

interface Props {
	isVisible: boolean
	closeModal: () => void
	data?: UserRole
	refresh: () => void
}

const RoleFormModal = ({ isVisible, closeModal, data, refresh }: Props) => {
	// form data

	const [titre, setTitre] = useState(data?.titre || "")
	const [permissions, setPermissions] = useState(data?.permissions.split(",") || [])
	const [suppression, setSuppression] = useState(data?.suppression.split(",") || [])

	// if data is defined, load it into the form

	useEffect(() => {
		// if not, reset the form
		if (!data) {
			resetFields()
			return
		}
		setTitre(data.titre)
		setPermissions(data.permissions.split(","))
		setSuppression(data.suppression.split(","))
	}, [data, isVisible])

	// permission options

	const permissionOptions: SelectOption[] = permissionList.map((permission) => ({
		label: capitalizeFirstLetter(permission),
		value: permission
	}))

	// suppression options

	const suppressionOptions: SelectOption[] = suppressionList.map((suppression) => ({
		label: capitalizeFirstLetter(suppression),
		value: suppression
	}))

	// handlers

	const makeAPIRequest = useAPIRequest()

	const { data: sessionData, status } = useSession()

	const session = sessionData as MySession | null

	const postNewRole = () => {
		if (!session) return

		// start with bringing the data together
		const newRole: UserRoleCreate = {
			titre,
			permissions: permissions.join(","),
			suppression: suppression.join(",")
		}

		// make the request to the API
		return makeAPIRequest<UserRoleCreate, UserRoleCreate>(session, "post", "roles", undefined, newRole)
	}

	const updateRole = () => {
		if (!data || !session) return
		// start with bringing the data together
		const permissionsString = permissions.join(",")
		const suppressionString = suppression.join(",")

		const updatedRole: UserRoleUpdate = {
			new_titre: titre !== data?.titre ? titre : undefined,
			permissions: permissionsString !== data?.permissions ? permissionsString : undefined,
			suppression: suppressionString !== data?.suppression ? suppressionString : undefined
		}

		// make the request to the API
		return makeAPIRequest<UserRoleUpdate, UserRole>(session, "put", "roles", data.titre, updatedRole)
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
		if (typeof value == "string") return !value
		return typeof value == "undefined" || value == null
	}

	const validateForm = async () => {
		if (!session) return false

		let validated = true
		const newErrorFields: string[] = []

		// default error message

		setErrorMessage("Veuillez remplir tous les champs requis...")

		if (isEmpty(titre)) {
			validated = false
			newErrorFields.push("titre")
		}

		if (!newErrorFields.includes("titre")) {
			// if we're creating a new role, make sure the title is unique
			// if we're updating a role, make sure the title is unique, but not the current one

			const role = await makeAPIRequest<UserRole, UserRole | undefined>(
				session,
				"get",
				"roles",
				titre,
				undefined,
				(res) => res.data,
				() => undefined
			)

			if ((role && !data) || (data && role && !(role instanceof Error) && data.titre !== role.titre)) {
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
		if (!(await validateForm())) {
			setValidationError(true)
			return
		}
		if (data) await updateRole()
		else await postNewRole()
		resetFields()
		closeModal()
		refresh()
	}

	// utils

	// get the value of an option from its label
	// and vice versa
	// this is needed because the Select component

	const getOptionValue = (optionLabel: string, options: SelectOption[]) => {
		const option = options.find((opt) => opt.label == optionLabel)
		if (!option) return ""
		return option.value as string
	}

	const getOptionValueForEach = (optionLabels: string[], options: SelectOption[]) => {
		return optionLabels.map((label) => getOptionValue(label, options))
	}

	const getValueForOption = (optionValue: string, options: SelectOption[]) => {
		const option = options.find((opt) => opt.value == optionValue)
		if (!option) return ""
		return option.label as string
	}

	const getValueForOptionForEach = (optionValues: string[], options: SelectOption[]) => {
		return optionValues.map((value) => getValueForOption(value, options))
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
									onChange={(newVal) => setTitre(newVal)}
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
						defaultValue={getValueForOptionForEach(permissions, permissionOptions)}
						value={getValueForOptionForEach(permissions, permissionOptions)}
						onChange={(newVal) => setPermissions(getOptionValueForEach(newVal, permissionOptions))}
						isMulti
					/>
				</FieldContainer>
				<FieldContainer fullWidth>
					<Label>Suppression</Label>
					<Select
						name="suppression"
						options={suppressionOptions}
						defaultValue={getValueForOptionForEach(suppression, suppressionOptions)}
						value={getValueForOptionForEach(suppression, suppressionOptions)}
						onChange={(newVal) => setSuppression(getOptionValueForEach(newVal, suppressionOptions))}
						isMulti
					/>
				</FieldContainer>
				{validationError ? <p className={styles.error}>{errorMessage}</p> : <></>}
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
