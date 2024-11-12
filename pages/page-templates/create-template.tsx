import Select from "@components/form-elements/select"
import TextInput from "@components/form-elements/text-input"
import GoBackButton from "@components/go-back-button"
import HorizontalSeperator from "@components/utils/horizontal-seperator"
import { itemTypes } from "@conf/api/search"
import { createFormConf, FormElement, FormFieldsObj } from "@conf/create"
import useAPIRequest from "@hook/useAPIRequest"
import styles from "@styles/page-templates/create-template.module.scss"
import colors from "@styles/abstracts/_colors.module.scss"
import { itemTypetoAttributeName, toSingular } from "@utils/general"
import { SelectOption } from "@utils/react-select/types"
import { DynamicObject } from "@utils/types"
import { AxiosResponse } from "axios"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { StylesConfig } from "react-select"
import CreateForm from "@components/forms/create-form"
import { fichesCreateConf } from "@conf/api/data-types/fiche"
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons"
import { MySession } from "@conf/utility-types"
import { useSession } from "next-auth/react"
import { ScrollArea } from "@components/radix/scroll-area"
import { cn } from "@utils/tailwind"
import { Input } from "@components/radix/input"
import Combobox from "@components/radix/combobox"
import { Button } from "@components/radix/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

// custom styles for the fiche type select

const customSelectStyles: StylesConfig = {
	control: (base, state) => ({
		...base,
		border: "0",
		boxShadow: `0px 30px 60px ${colors["primary-400"]}`,
		background: colors["white-100"],
		paddingLeft: "10px",
		paddingRight: "10px",
		borderRadius: state.isMulti ? "10px" : "5px",
		"&:hover": {
			border: "0",
			cursor: "pointer"
		}
	})
}

interface Props {
	itemType: string
	hidden?: string[]
	defaultValues?: DynamicObject
}

const CreateTemplate = ({ itemType, hidden, defaultValues }: Props) => {
	// access url query

	const router = useRouter()

	// state which will hold the form data
	// => each field's value & its configuration info

	const [formData, setFormData] = useState<FormFieldsObj>()

	// in case the item type is Fiche
	// keep track of the type of Fiche the user's chosen

	const [ficheType, setFicheType] = useState<string>("opération")

	const ficheTypeOptions: SelectOption[] = [
		{
			label: "Opération",
			value: "opération"
		},
		{
			label: "Relance",
			value: "relance"
		},
		{
			label: "Panne",
			value: "panne"
		},
		{
			label: "Systématique",
			value: "systématique"
		}
	]

	// don't allow unauthorized users to create "fiches systematiques"

	const session = useSession()

	const userRole = (session.data as MySession | null)?.userRole

	const getFicheTypeOptions = () =>
		userRole && userRole.permissions.includes("systematiques") ? ficheTypeOptions : ficheTypeOptions.filter((option) => option.value != "systématique")

	// build the object which will hold our form's state
	// its shape is determined by the createFormConf for the current item type
	// it's a list of key / value pairs for which the keys are an attribute
	// of the current item type => a key of formConf
	// & the values are the values the user entered in the form
	// => the default values are loaded by the following function
	// as it builds this object

	// also, in case it is a Fiche object
	// default values will be pulled from the ficheCreateConf object
	// according to the current fiche type

	const getInitFormData = () => {
		if (!(itemType in createFormConf)) return

		// load the form fields for the current item type

		let fields = Object.entries<FormElement>(createFormConf[getFormItemType()])

		let initFormData: FormFieldsObj = {}

		for (let [field, conf] of fields) {
			// load the default value, if there is one
			let defaultValue = null
			if (typeof conf.defaultValue != "undefined") {
				defaultValue = conf.defaultValue
			}

			// for each form field
			// load it's config info into the form component's state
			initFormData[field] = {
				value: defaultValue,
				conf: { ...conf }
			}
		}

		// if we're creating a Fiche
		// & the target item was provided through the URL query
		// load it

		const queryItemType = typeof router.query.itemType !== "undefined" ? router.query.itemType.toString() : ""
		const queryItemId = typeof router.query.itemId !== "undefined" ? router.query.itemId.toString() : ""

		if (
			itemType.includes("fiches") &&
			queryItemType &&
			queryItemId &&
			// make sure the id is a number
			// @ts-ignore
			!isNaN(queryItemId) &&
			!isNaN(parseFloat(queryItemId))
		) {
			const fieldName = itemTypetoAttributeName(queryItemType)
			initFormData[fieldName].value = Number(queryItemId)
		}

		if (itemType.includes("fiches")) {
			// & load default values for the current type

			for (const fieldName in fichesCreateConf[ficheType].defaultValues) {
				initFormData[fieldName].value = fichesCreateConf[ficheType].defaultValues[fieldName]
			}

			// also remove excluded fields

			for (const fieldName of fichesCreateConf[ficheType].excludedFields) {
				delete initFormData[fieldName]
			}
		}

		// load the default values provided as props

		if (defaultValues) {
			for (const fieldName in defaultValues) {
				initFormData[fieldName].value = defaultValues[fieldName]
			}
		}

		// once we're done loading the form data for the current item
		// return it
		return initFormData
	}

	useEffect(() => setFormData(getInitFormData()), [itemType, ficheType])

	// useEffect(() => console.log(formData), [formData])

	// the following function is passed to form elements
	// so they can update the value of the field they're rendering

	const updateField = (fieldName: string, newValue: any) => {
		let newFormData = { ...formData }
		newFormData[fieldName].value = newValue
		// update the error state is the field ain't empty
		if (newFormData[fieldName].isInErrorState) {
			newFormData[fieldName].isInErrorState = isEmpty(newValue)
		}
		// console.log(`'${fieldName}' was updated!`)
		// console.log(newValue)
		setFormData(newFormData)
	}

	// force re-render

	const [refreshTrigger, setRefreshTrigger] = useState(false)

	const refresh = () => setRefreshTrigger(!refreshTrigger)

	// get the value of each field
	// & build an object we can send in a POST request to our backend API

	const buildSubmitData = () => {
		let submitData: DynamicObject = {}
		for (const field in formData) {
			if (field == "nom") submitData[field] = (formData[field].value as string).trim()
			else submitData[field] = formData[field].value
		}
		return submitData
	}

	// submit logic

	const makeAPIRequest = useAPIRequest()

	// make sure no required field is left empty

	const isEmpty = (value: any) => {
		if (typeof value == "string") return !value
		return typeof value == "undefined" || value == null
	}

	const ficheTargetItemTypes = ["exposition_id", "element_id"]

	// the following function checks whether any of the fiche target item type fields
	// has a value

	const isFicheTargetItemEmpty = () => {
		if (!formData) return true
		let isTargetFieldEmpty = true
		for (const fieldName of ficheTargetItemTypes) {
			if (!isEmpty(formData[fieldName].value)) {
				isTargetFieldEmpty = false
			}
		}
		return isTargetFieldEmpty
	}

	// validate the form before submitting it

	const [errorMessage, setErrorMessage] = useState<string>("")

	const [validationError, setValidationError] = useState(false)

	const validateFormData = async () => {
		if (!formData || !session.data) return false
		let validated = true

		// default error message

		setErrorMessage("Remplissez les champs requis avant de soumettre le formulaire...")

		const validateField = (fieldName: string) => {
			// if the value of the current field is empty
			// let the user know by highlighting the field
			// using error state

			// but first, exclude fiche target item fields
			// cause they're nullable
			if (itemType.includes("fiches") && ficheTargetItemTypes.includes(fieldName)) {
				return
			}
			// proceed
			if (isEmpty(formData[fieldName].value) && formData[fieldName].conf.required) {
				formData[fieldName].isInErrorState = true
				validated = false
			}
		}

		// run check for each field

		for (const fieldName in formData) {
			validateField(fieldName)
		}

		if (itemType.includes("fiches") && isFicheTargetItemEmpty()) {
			formData["element_id"].isInErrorState = true
			validated = false
		}

		// make sure the nom field is unique, except for fiches

		if (!itemType.includes("fiches")) {
			const item = await makeAPIRequest<any, any>(
				session.data as MySession,
				"get",
				itemType,
				formData["nom"].value,
				undefined,
				(res) => res.data,
				() => undefined
			)
			// if we get an item back
			// it means the nom field is not unique
			if (item) {
				formData["nom"].isInErrorState = true
				validated = false
				setErrorMessage("Un élément avec ce nom existe déjà...")
			}
		}

		return validated
	}

	const handleSubmit = async () => {
		if (!session.data) return

		const submitData = buildSubmitData()
		// console.log("submit data ==> ")
		// console.log(submitData)
		// return
		// console.log("is validated ? => ", validateFormData())
		if (!(await validateFormData())) {
			setValidationError(true)
			refresh()
			return
		} else {
			setValidationError(false)
			refresh()
		}
		// POST the form data to the appropriate API endpoint
		// if our form submission was successful

		const handleSuccess = (res: AxiosResponse<any>) => {
			// in case our request succeeded
			if (res.status == 200) {
				// redirect the user to the view page
				// for the new item that's been create
				const getItemType = () => getFormItemType().replace("_", "/")
				router.push(`/view/${getItemType()}/${res.data.id}`)
			}
		}

		// POST the data

		makeAPIRequest(session.data as MySession, "post", getFormItemType(), undefined, submitData, handleSuccess)
	}

	// utils

	const getItemTypeLabel = () => {
		const label = itemTypes.find((type) => type.value == itemType)?.label.slice(0, -1)
		return itemType?.split("_").length > 1 ? toSingular(itemType) : label || ""
	}

	const getTitlePlaceHolder = () => {
		if (!(itemType in createFormConf)) return "Nom..."
		return createFormConf[itemType].nom.label
	}

	const getFormItemType = () => {
		return itemType == "fiches" && ficheType == "systématique" ? "fiches_systematiques" : itemType
	}

	// if the item type is Fiche,
	// hide fields that are marked as hidden in the create conf object

	// also, in case a list of hidden fields are provided as props
	// include it in the return value

	const getHiddenFields = () => {
		if (!itemType || !itemType.includes("fiches")) return
		const hiddenFields = itemType.includes("fiches") ? fichesCreateConf[ficheType].hiddenFields : []
		return hidden ? [...hidden, ...hiddenFields] : hiddenFields
	}

	// handlers

	// make sure the main field doesn't have spaces at the beginning or the end of it
	// to avoid bugs in communicating with the backend API

	const handleTitleChange = (newTitle: string) => updateField("nom", newTitle)

	// render

	return (
		<>
			<div
				className={cn(
					"w-full flex flex-wrap gap-[32px] sticky top-[80px]",
					"border-b border-blue-600/10",
					"bg-neutral-50/40 backdrop-blur-3xl",
					"px-[2.5vw] py-4"
				)}>
				<GoBackButton />
				<div className="flex-1 flex flex-wrap gap-4 max-sm:flex-col">
					<div className="flex flex-1 flex-col min-w-[350px] gap-4">
						<Input
							className={cn(
								"placeholder:text-blue-600/60 bg-transparent",
								"text-xl min-[400px]:text-2xl sm:text-3xl text-blue-600",
								"border border-blue-600/20 ring-offset-blue-600/20",
								itemType == "fiches" && ficheType == "relance" ? "text-yellow-600 border-yellow-600/20 placeholder:text-yellow-600/60" : "",
								itemType == "fiches" && ficheType == "panne" ? "text-red-600 border-red-600/20 placeholder:text-red-600/60" : "",
								itemType == "fiches" && ficheType == "systématique"
									? "text-emerald-600 border-emerald-600/20 placeholder:text-emerald-600/60"
									: "",
								formData?.nom?.isInErrorState ? "border-red-600 ring-red-600" : ""
							)}
							placeholder={getTitlePlaceHolder()}
							onChange={(e) => handleTitleChange(e.target.value)}
							value={formData?.nom?.value ?? ""}
						/>
						<div className="w-full flex flex-wrap items-center justify-between gap-4">
							<div className="flex items-center gap-4">
								<span className="text-sm uppercase tracking-widest text-blue-600/60">{getItemTypeLabel()}</span>
								{itemType == "fiches" ? (
									<Combobox
										className="w-fit"
										options={getFicheTypeOptions()}
										onChange={(option) => setFicheType(option.value as string)}
										selected={ficheTypeOptions.find((option) => option.value == ficheType)}
									/>
								) : (
									<></>
								)}
							</div>
							<Button
								onClick={handleSubmit}
								className="flex items-center gap-[8px]">
								<FontAwesomeIcon icon={faFloppyDisk} />
								Créer
							</Button>
						</div>
						{validationError ? <span className="text-red-700 text-sm font-normal">{errorMessage}</span> : <></>}
					</div>
				</div>
			</div>
			<main className="w-full h-full flex-1 flex flex-col gap-16 px-[7%] gap-y-[32px] pt-6">
				{formData ? (
					<CreateForm
						itemType={getFormItemType()}
						formData={formData}
						onChange={updateField}
						hidden={getHiddenFields()}
						onSubmit={handleSubmit}
					/>
				) : (
					<></>
				)}
			</main>
		</>
	)
}

export default CreateTemplate
