import FicheTargetSelect from "@components/page-templates/create/fiche-target-select"
import { apiURLs } from "@conf/api/conf"
import { FormFieldsObj } from "@conf/create"
import { itemTypetoAttributeName, toISO } from "@utils/general"
import { getFilterLabel } from "@conf/api/search"
import Label from "@components/form-elements/label"
import TextInput from "@components/form-elements/text-input"
import CheckBox from "@components/form-elements/checkbox"
import DateInput from "@components/form-elements/date-input"
import TimeDeltaInput from "@components/form-elements/time-delta-input"
import ExpoOpeningPeriodInput from "@components/form-elements/expo-opening-period-input"
import NumberInput from "@components/radix/number-input"
import ItemComboBox from "@components/radix/item-combobox"
import ItemMultiSelectCombobox from "@components/radix/item-multi-select-combobox"
import { SelectOption } from "@utils/react-select/types"
import { Switch } from "@components/radix/switch"

interface Props {
	itemType: string
	fieldName: string
	formData: FormFieldsObj
	onChange: (field: string, value: any) => void
}

const FormField = ({ itemType, fieldName, formData, onChange }: Props) => {
	const isHidden = () => formData[fieldName].conf.type == "expositions" && itemType.includes("fiches")

	const getField = () => {
		const { conf } = formData[fieldName]

		// utils

		const getTextValue = () => {
			const { value: val } = formData[fieldName]
			return val ? val : ""
		}

		// utils for date fields

		// for date fields
		// convert the value to a Date object before passing it to the DateInput component
		const getDateValue = () => {
			const { value: val } = formData[fieldName]
			return val ? new Date(val) : undefined
		}

		const handleDateChange = (newValue: Date) => onChange(fieldName, toISO(newValue))

		const handleChange = (value: any) => onChange(fieldName, value)

		// render

		switch (conf.type) {
			case "text":
				return (
					<TextInput
						fullWidth
						name={fieldName}
						onChange={handleChange}
						currentValue={getTextValue()}
						required={conf.required}
						isInErrorState={formData[fieldName].isInErrorState}
					/>
				)
			case "textArea":
				return (
					<TextInput
						name={fieldName}
						onChange={handleChange}
						currentValue={getTextValue()}
						fullWidth
						isTextArea
						required={conf.required}
						isInErrorState={formData[fieldName].isInErrorState}
					/>
				)
			case "boolean":
				return (
					<Switch
						checked={formData[fieldName].value}
						onChange={handleChange}
					/>
				)
			case "number":
				return (
					<NumberInput
						name={fieldName}
						value={formData[fieldName].value}
						onChange={handleChange}
					/>
				)
			case "timeDelta":
				// for fiches systematiques
				// make sure rappel is always smaller than periodicite
				const getMax = () => {
					if (fieldName == "rappel" && typeof formData["periodicite"] !== "undefined") {
						return formData["periodicite"].value
					}
				}
				const getMin = () => {
					if (fieldName == "periodicite" && typeof formData["rappel"] !== "undefined") {
						return formData["rappel"].value
					}
				}
				const isStrict = () => ["periodicite", "rappel"].includes(fieldName)
				return (
					<TimeDeltaInput
						name={fieldName}
						value={formData[fieldName].value}
						max={getMax()}
						min={getMin()}
						strictComparison={isStrict()}
						onChange={handleChange}
						isInErrorState={formData[fieldName].isInErrorState}
					/>
				)
			case "date":
				const getMinDate = () => {
					// make sure an "ending date" field never precedes
					// the "starting date" associated with it
					if (fieldName == "date_fin" && typeof formData["date_debut"] !== "undefined") {
						return new Date(formData["date_debut"].value)
					}
				}
				return (
					<DateInput
						className="w-full"
						name={fieldName}
						value={getDateValue()}
						onChange={handleDateChange}
						strict={true}
						format="dd/MM/yyyy"
						bigPadding={false}
						showLocaleDate
						minDate={getMinDate()}
					/>
				)
			case "elements":
				// in case we're dealing with a fiche item
				// instead of a select
				// render a FicheTargetSelect component
				if (itemType.includes("fiches")) {
					// get the correct item type for the target item

					const getCurrentItemType = () => {
						if (formData["element_id"].value) return "elements"
						if (formData["exposition_id"].value) return "expositions"
						return "elements"
					}

					// & the current selected item's value

					const getValue = () => formData[itemTypetoAttributeName(getCurrentItemType())].value

					return (
						<FicheTargetSelect
							currentItemType={getCurrentItemType()}
							value={getValue()}
							onChange={onChange}
							isInErrorState={formData[fieldName].isInErrorState}
						/>
					)
				} else {
					return (
						<ItemComboBox
							itemType={conf.type}
							name={getFilterLabel(fieldName, conf)}
							selected={formData[fieldName].value}
							onChange={handleChange}
							className={formData[fieldName].isInErrorState ? "border-red-600" : ""}
						/>
					)
				}
			case "itemList":
				// multi select
				if (!conf.item || !(conf.item in apiURLs)) {
					break
				}
				return (
					<ItemMultiSelectCombobox
						className="w-full"
						name={fieldName}
						itemType={conf.item}
						selectByLabel
						selected={formData[fieldName].value}
						onSelect={(o) => handleChange(o.map((option: SelectOption) => option.label))}
					/>
				)
			case "expoOpeningPeriod":
				return (
					<ExpoOpeningPeriodInput
						name={fieldName}
						value={formData[fieldName].value}
						onChange={handleChange}
					/>
				)
			default:
				// don't render a select if the item type is incorrect
				// or if we're dealing with a fiche item
				// & the current field is the task's target (expo or element)
				if (!(conf.type in apiURLs) || (["expositions", "elements"].includes(conf.type) && itemType.includes("fiches"))) return <></>
				// in case this field is a select
				// refering to an item type
				const selectName = getFilterLabel(fieldName, conf)
				return (
					<ItemComboBox
						itemType={conf.type}
						name={selectName}
						selected={formData[fieldName].value}
						onChange={handleChange}
						className={formData[fieldName].isInErrorState ? "border-red-600" : ""}
					/>
				)
		}
	}

	// render

	if (!(fieldName in formData)) return <></>

	return (
		<>
			{!isHidden() ? (
				<div className="flex flex-wrap items-center justify-between gap-[8px]">
					<Label htmlFor={fieldName}>{getFilterLabel(fieldName, formData[fieldName].conf)}</Label>
					{getField()}
				</div>
			) : (
				<></>
			)}
		</>
	)
}

export default FormField
