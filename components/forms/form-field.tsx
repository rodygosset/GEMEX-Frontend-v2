import FicheTargetSelect from "@components/page-templates/create/fiche-target-select";
import { apiURLs } from "@conf/api/conf";
import { FormFieldsObj } from "@conf/create";
import { itemTypetoAttributeName } from "@utils/general";
import { getFilterLabel } from "@conf/api/search";
import ItemSelectField from "@components/page-templates/create/item-select-field";
import Label from "@components/form-elements/label";


interface Props {
    itemType: string;
    fieldName: string;
    formData: FormFieldsObj;
    onChange: (field: string, value: any) => void;
}

const FormField = (
    {
        itemType,
        fieldName,
        formData,
        onChange
    }: Props
) => {

    const { conf } = formData[fieldName]

    const isHidden = () => (
        ["expositions", "elements"].includes(conf.type) &&
        itemType.includes("fiches")
    )

    const getField = () => {
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
    }

    return (
        <>
        {
            !isHidden() ?
            getField()
            :
            <></>
        }
        </>
    )
}

export default FormField