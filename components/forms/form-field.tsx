import styles from "@styles/components/forms/form-field.module.scss"
import FicheTargetSelect from "@components/page-templates/create/fiche-target-select";
import { apiURLs } from "@conf/api/conf";
import { FormFieldsObj } from "@conf/create";
import { itemTypetoAttributeName, toISO } from "@utils/general";
import { getFilterLabel } from "@conf/api/search";
import ItemSelectField from "@components/page-templates/create/item-select-field";
import Label from "@components/form-elements/label";
import TextInput from "@components/form-elements/text-input";
import CheckBox from "@components/form-elements/checkbox";
import DateInput from "@components/form-elements/date-input";
import { toDateObject } from "@utils/form-elements/date-input";
import { DateInputValue } from "@utils/types";
import TimeDeltaInput from "@components/form-elements/time-delta-input";
import ItemMultiSelect from "@components/form-elements/multi-select";
import NumericField from "@components/form-elements/numeric-field";


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

    

    const isHidden = () => (
        ["expositions", "elements"].includes(formData[fieldName].conf.type) &&
        itemType.includes("fiches")
    )

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

        switch(conf.type) {
            case "text":
                return (
                    <TextInput
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
                    <CheckBox
                        value={formData[fieldName].value}
                        onChange={handleChange}
                    />
                )
            case "number":
                return (
                    <NumericField
                        value={formData[fieldName].value}
                        onChange={handleChange}
                    />
                )
            case "timeDelta":
                // for fiches systematiques
                // make sure rappel is always smaller than periodicite
                const getMax = () => {
                    if(fieldName == "rappel" && typeof formData["periodicite"] !== "undefined") {
                        return formData["periodicite"].value
                    }
                }
                const getMin = () => {
                    if(fieldName == "periodicite" && typeof formData["rappel"] !== "undefined") {
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
                    if(fieldName == "date_fin" && typeof formData["date_debut"] !== "undefined") {
                        return new Date(formData["date_debut"].value)
                    }
                }
                return (
                    <DateInput 
                        name={fieldName}
                        value={getDateValue()} 
                        onChange={handleDateChange}
                        strict={true}
                        bigPadding={false}
                        showLocaleDate
                        minDate={getMinDate()}
                    />
                )
            case "ilots":
                // in case we're dealing with a fiche item
                // instead of a select
                // render a FicheTargetSelect component
                console.log("started here")
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
                            isInErrorState={formData[fieldName].isInErrorState}
                        />
                    )
                } else {
                    return (
                        <ItemSelectField
                            itemType={conf.type}
                            name={getFilterLabel(fieldName, conf)}
                            value={formData[fieldName].value}
                            onSelect={handleChange}
                            isInErrorState={formData[fieldName].isInErrorState}
                        />
                    )
                }
                console.log("got here")
            case "itemList":
                // multi select
                if(!conf.item || !(conf.item in apiURLs)) { break }
                return (
                    <ItemMultiSelect
                        name={fieldName}
                        itemType={conf.item}
                        selected={formData[fieldName].value}
                        onChange={handleChange}
                    />
                )
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
                        itemType={conf.type}
                        name={selectName}
                        value={formData[fieldName].value}
                        onSelect={handleChange}
                        isInErrorState={formData[fieldName].isInErrorState}
                    />
                )
        }
    }

    // render

    if(!(fieldName in formData)) return <></>

    return (
        <>
        {
            !isHidden() ?
            <div className={styles.field}>
                <Label htmlFor={fieldName}>{getFilterLabel(fieldName, formData[fieldName].conf)}</Label>
                { getField() }
            </div>
            :
            <></>
        }
        </>
    )
}

export default FormField