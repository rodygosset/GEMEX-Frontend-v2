import styles from "@styles/components/form-elements/select.module.scss"
import { SelectOption } from "@utils/react-select/types";
import { useEffect, useState } from "react";
import ReactSelect, { StylesConfig } from "react-select";


interface Props {
    options: SelectOption[];
    defaultValue?: string | number;
    form?: string;
    name: string;
    isMulti?: boolean;
    isSearchable?: boolean;
    isLoading?: boolean;
    required?: boolean;
    hidden?: boolean;
    onChange?: <T>(optionValue: T | T[]) => void
}

const selectStyles: StylesConfig = {
    // todo
}

const Select = (
    {
        options,
        defaultValue,
        form,
        name,
        isMulti = false,
        isSearchable = true,
        isLoading = false,
        required = false,
        hidden = false,
        onChange
    }: Props
    ) => {

    
    // configuration

    const placeholder = "Sélectionner..."
    const loadingMessage = "Chargement..."
    const noOptionsMessage = "Aucune option"

    // state & lyfecycle

    const getDefaultOption = () => options.find(option => option.value == defaultValue)

    const [selected, setSelected] = useState<SelectOption>()

    useEffect(() => setSelected(getDefaultOption()), [])

    // handle option selection

    const handleSelect = (newValue: unknown) => {
        const newVal = newValue as SelectOption
        setSelected(newVal)
        if(onChange) { // if a handler was provided
            if(isMulti) {
                // in case this is a multi select, 
                // convert SelectOption[] to string[]
                // the string objects being the label of each selected option
                onChange((newValue as SelectOption[]).map(option => option.label))
            } else {
                // otherwise pass the option's value to the handler
                onChange(newVal.value)
            }
        }
    }

    return (
        hidden ? 
        <></>
        :
        <ReactSelect
            className={styles.select}
            options={options}
            styles={selectStyles}
            isSearchable={isSearchable}
            isMulti={isMulti}
            isLoading={isLoading}
            menuPortalTarget={document.body}
            defaultValue={defaultValue}
            value={selected}
            form={form}
            name={name}
            placeholder={placeholder}
            loadingMessage={() => loadingMessage}
            noOptionsMessage={() => noOptionsMessage}
            required={required}
            onChange={handleSelect}
        />
    )

}

export default Select