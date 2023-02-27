import FicheTargetSelect from "@components/page-templates/create/fiche-target-select";
import ItemSelectField from "@components/page-templates/create/item-select-field";
import { apiURLs } from "@conf/api/conf";
import { getFilterLabel } from "@conf/api/search";
import { FormFieldsObj } from "@conf/create";
import styles from "@styles/page-templates/create-template.module.scss"
import { itemTypetoAttributeName } from "@utils/general";
import { useEffect, useState } from "react";

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
            const { conf } = formData[fieldName]
            switch(conf.type) {
                case "ilots":
                    // in case we're dealing with a fiche item
                    // instead of a select
                    // render a FicheTargetSelect component
                    if(itemType.includes("fiches")) {

                        // get the correct item type for the target item

                        const getCurrentItemType = () => {
                            if(formData["element_id"].value) return "elements"
                            if(formData["exposition_id"].value) return "expositions"
                            if(formData["ilot_id"].value) return "ilots"
                            return "elements"
                        }

                        // & the current selected item's value

                        const getValue = () => formData[itemTypetoAttributeName(getCurrentItemType())].value

                        return (
                            <FicheTargetSelect
                                currentItemType={getCurrentItemType()}
                                value={getValue()}
                                onChange={onChange}
                            />
                        )
                    }
                default: 
                    // don't render a select if the item type is incorrect
                    // or if we're dealing with a fiche item 
                    // & the current field is the task's target (ilot, expo or element)
                    if(!(conf.type in apiURLs) ||
                        (
                            ["expositions", "elements"].includes(conf.type) &&
                            itemType.includes("fiches")
                        )) return <></>
                    // in case this field is a select
                    // refering to an item type
                    const selectName = getFilterLabel(fieldName, conf)
                    return (
                        <ItemSelectField
                            key={selectName}
                            itemType={conf.type}
                            name={selectName}
                            value={formData[fieldName].value}
                            onSelect={value => onChange(fieldName, value)}
                        />
                    )
            }
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