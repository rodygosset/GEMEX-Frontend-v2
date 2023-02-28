import { FormFieldsObj } from "@conf/create";
import styles from "@styles/page-templates/create-template.module.scss"
import { useEffect, useState } from "react";
import FormField from "./form-field";

// this component is used to render the form elements
// according to the item type
// on the Create page

interface Props {
    itemType: string;
    formData: FormFieldsObj;
    onChange: (field: string, value: any) => void;
    hidden?: string[];
}

const CreateForm = (
    {
        itemType,
        formData,
        onChange,
        hidden
    }: Props
) => {

    const hiddenAttributes = [
        "nom",
        "username",
        "titre"
    ]

    // the content is displayed in two columns / lists

    const [firstColumnFields, setFirstColumnFields] = useState<string[]>([])
    const [secondColumnFields, setSecondColumnFields] = useState<string[]>([])


    // divide the item's attribute between the two columns

    useEffect(() => {
        const fields = Object.keys(formData)
        .filter(field => !hiddenAttributes.includes(field))
        .filter(field => hidden ? !hidden.includes(field) : true)
        const middle = Math.floor(fields.length / 2)
        setFirstColumnFields(fields.slice(0, middle))
        setSecondColumnFields(fields.slice(middle))
    }, [itemType])

    // render the list of fields for the current item type
    // this logic was exported into a function because DRY

    const renderList = (fieldList: string[]) => {
        return fieldList.map(fieldName => {
            return (
                <FormField 
                    key={fieldName}
                    itemType={itemType}
                    fieldName={fieldName}
                    formData={formData}
                    onChange={onChange}
                />
            )
        })
    }


    // render

    return (
        <form id={styles.createForm}>
            <div className={styles.column}>
            {
                renderList(firstColumnFields)
            }
            </div>
            <div className={styles.column}>
            {
                renderList(secondColumnFields)
            }
            </div>
        </form>
    )
}

export default CreateForm