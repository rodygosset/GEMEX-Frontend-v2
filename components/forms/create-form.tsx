import FileInput from "@components/form-elements/file-input"
import { FormFieldsObj } from "@conf/create"
import { Fragment, useEffect, useState } from "react"
import FormField from "./form-field"

// this component is used to render the form elements
// according to the item type
// on the Create page

interface Props {
	itemType: string
	formData: FormFieldsObj
	onChange: (field: string, value: any) => void
	onSubmit: () => void
	hidden?: string[]
}

const CreateForm = ({ itemType, formData, onChange, onSubmit, hidden }: Props) => {
	const hiddenAttributes = ["nom", "username", "titre"]

	// the content is displayed in two columns / lists

	const [firstColumnFields, setFirstColumnFields] = useState<string[]>([])
	const [secondColumnFields, setSecondColumnFields] = useState<string[]>([])

	// divide the item's attribute between the two columns

	useEffect(() => {
		const fields = Object.keys(formData)
			.filter((field) => !hiddenAttributes.includes(field))
			.filter((field) => (hidden ? !hidden.includes(field) : true))
		const middle = Math.floor(fields.length / 2)
		setFirstColumnFields(fields.slice(0, middle))
		setSecondColumnFields(fields.slice(middle))
	}, [itemType, formData])

	// render the list of fields for the current item type
	// this logic was exported into a function because DRY

	const renderList = (fieldList: string[]) =>
		fieldList.map((fieldName) =>
			fieldName == "fichiers" ? (
				<Fragment key={fieldName}></Fragment>
			) : (
				<FormField
					key={fieldName}
					itemType={itemType}
					fieldName={fieldName}
					formData={formData}
					onChange={onChange}
				/>
			)
		)

	// render

	return (
		<form
			className="flex flex-col items-stretch gap-[32px]"
			onSubmit={onSubmit}>
			<div className="flex flex-wrap gap-[32px] w-full max-md:flex-col">
				<div className="flex flex-col items-stretch gap-[32px] flex-1">{renderList(firstColumnFields)}</div>
				<div className="flex flex-col items-stretch gap-[32px] flex-1">{renderList(secondColumnFields)}</div>
			</div>
			{
				// only render the file cards
				// if the current item contains a list of file names
				"fichiers" in formData ? (
					<FileInput
						value={formData["fichiers"].value}
						onChange={(value) => onChange("fichiers", value)}
					/>
				) : (
					<></>
				)
			}
		</form>
	)
}

export default CreateForm
