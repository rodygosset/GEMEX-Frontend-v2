import styles from "@styles/components/form-elements/select.module.scss"
import colors from "@styles/abstracts/_colors.module.scss"
import typography from "@styles/base/_typography.module.scss"
import { SelectOption } from "@utils/react-select/types";
import { ComponentType, useEffect, useState } from "react";
import ReactSelect, { components, CSSObjectWithLabel, DropdownIndicatorProps, StylesConfig } from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

export type OnSelectHandler<T = any> = (optionValue: T) => void

interface Props {
    options: SelectOption[];
    defaultValue?: string | string[] | number;
    value?: string | string[] | number;
    form?: string;
    name: string;
    isMulti?: boolean;
    isSearchable?: boolean;
    isLoading?: boolean;
    required?: boolean;
    hidden?: boolean;
    large?: boolean;
    fullWidth?: boolean;
    bigPadding?: boolean;
    row?: boolean;
    customStyles?: StylesConfig;
    isInErrorState?: boolean;
    onChange?: OnSelectHandler;
}

const typographyReset: CSSObjectWithLabel = {
    fontSize: typography["text-sm-font-size"],
    fontWeight: typography["font-weight-medium"]
}

const stateMessagesStyle = (base: CSSObjectWithLabel) => ({
    ...base,
    ...typographyReset,
    color: colors["primary-600"]
})

export const selectStyles: StylesConfig = {
    container: (base, state) => ({
        ...base,
        width: state.isMulti ? "100%" : "150px",
        minWidth: "150px"
    }),
    control: (base, state) => ({
        ...base,
        border: "0",
        boxShadow: "none",
        background: colors["primary-100"],
        paddingLeft: "10px",
        paddingRight: "10px",
        borderRadius: state.isMulti ? "10px" : "5px",
        "&:hover": {
            border: "0",
            boxShadow: "none",
            cursor: "pointer"
        }
    }),
    valueContainer: base => ({
        ...base,
        padding: "10px"
    }),
    indicatorSeparator: () => ({
        display: "none"
    }),
    singleValue: base => ({
        ...base,
        ...typographyReset,
        color: colors["primary"],
    }),
    clearIndicator: base => ({
        ...base,
        color: colors["primary-400"],
        "&:hover": {
            color: colors["primary"]
        }
    }),
    placeholder: stateMessagesStyle,
    loadingMessage: stateMessagesStyle,
    noOptionsMessage: stateMessagesStyle,
    loadingIndicator: base => ({
        ...base,
        color: colors["primary"]
    }),
    dropdownIndicator: base => ({
        ...base,
        color: colors["primary"],
        "&:hover": {
            color: colors["primary"]
        }
    }),
    menuPortal: base => ({
        ...base,
        zIndex: 600
    }),
    menu: base => ({
        ...base,
        boxShadow: `0px 30px 60px ${colors["primary-200"]}`
    }),
    option: (base, state) => ({
        ...base,
        ...typographyReset,
        color: state.isSelected || state.isFocused ? colors["primary"] : colors["primary-600"],
        background: state.isSelected || state.isFocused ? colors["primary-100"] : "none",
        "&:hover": {
            color: colors["primary"],
            background: colors["primary-100"],
            cursor: "pointer"
        },
    }),
    multiValue: base => ({
        ...base,
        fontSize: typography["text-sm-font-size"],
        fontWeight: typography["font-size-medium"],
        color: colors["primary"],
        padding: "5px 10px",
        borderRadius: "7px",
        // border: `2px solid ${colors["primary-100"]}`,
        // background: "none",
        background: colors["primary-100"],
        gap: "5px"
    }),
    multiValueLabel: base => ({
        ...base,
        fontSize: typography["text-sm-font-size"],
        fontWeight: typography["font-size-medium"],
        color: colors["primary"]
    }),
    multiValueRemove: base => ({
        ...base,
        borderRadius: "5px",
        ":hover": {
            color: colors["error"],
            background: colors["error-100"]
        }
    }),
}

const Select = (
    {
        options,
        defaultValue,
        value,
        form,
        name,
        isMulti = false,
        isSearchable = true,
        isLoading = false,
        required = false,
        hidden = false,
        large,
        fullWidth,
        bigPadding,
        row,
        customStyles,
        isInErrorState,
        onChange
    }: Props
    ) => {

    
    // configuration

    const placeholder = "Sélectionner..."
    const loadingMessage = "Chargement..."
    const noOptionsMessage = "Aucune option"

    // state & lyfecycle

    const getOptionFromValue = (val: typeof value) => {
        if(isMulti && val) {  
            // make sure val ain't null or undefined ==> fool-proofing
            // find all options part of the provided array of strings (val)
            // which represent the options' labels
            return options.filter(option => (val as string[]).includes(option.label))
        } else {
            // just find a single option matching the value
            return options.find(option => option.value == val)
        }
    }

    const [selected, setSelected] = useState<SelectOption | SelectOption[]>()

    useEffect(() => {
        if(typeof defaultValue !== "undefined" && !isLoading) {
            setSelected(getOptionFromValue(defaultValue))
        }
    }, [defaultValue, isLoading, options])

    useEffect(() => {
        if(typeof value !== "undefined") {
            setSelected(getOptionFromValue(value))
        }
    }, [value, options])

    // handle option selection

    const handleSelect = (newValue: unknown) => {
        const newVal = newValue as SelectOption | SelectOption[]
        setSelected(newVal)
        if(onChange) { // if a handler was provided
            if(isMulti) {
                // in case this is a multi select, 
                // convert SelectOption[] to string[]
                // the string objects being the label of each selected option
                onChange((newValue as SelectOption[]).map(option => option.label))
            } else {
                // otherwise pass the option's value to the handler
                // @ts-ignore
                onChange(newVal?.value)
            }
        }
    }

    // utils

    const getDropdownIcon = (isMulti: boolean, menuIsOpen: boolean) => {
        if(isMulti) {
            return menuIsOpen ? faChevronUp : faChevronDown
        } else {
            return menuIsOpen ? faCaretUp : faCaretDown
        }
    }

    const getClassNames = () => {
        let classNames = ''
        classNames += large ? styles.large : ''
        classNames += fullWidth ? ' ' + styles.fullWidth : ''
        classNames += isInErrorState ? ' ' + styles.error : ''
        return classNames
    }

    const bigPaddingStyles: StylesConfig = {
        control: (base, state) => ({
            ...(typeof selectStyles.control !== "undefined" ? selectStyles.control(base, state) : {}),
            padding: "7px 10px"
        })
    }

    const rowStyles: StylesConfig = {
        valueContainer: (base, state) => ({
            ...(typeof selectStyles.valueContainer !== "undefined" ? selectStyles.valueContainer(base, state) : {}),
            flexWrap: "nowrap",
            flexShrink: 0
        })
    }
    // include customStyles if it was provided
    
    const getStyles = () => {
        let baseStyles = customStyles ? { ...selectStyles, ...customStyles } : selectStyles
        baseStyles = row ? { ...baseStyles, ...rowStyles } : baseStyles
        baseStyles = bigPadding ? { ...baseStyles, ...bigPaddingStyles } : baseStyles
        return baseStyles
    }

    // replace the dropdown indicator with a caret or a chevron
    // depending on whether this is a simple or multi select

    const customDropdownIndicator: ComponentType<DropdownIndicatorProps> = props => (
        <components.DropdownIndicator {...props}>
            <FontAwesomeIcon icon={getDropdownIcon(props.isMulti, props.selectProps.menuIsOpen)} />
        </components.DropdownIndicator>
    )

    return (
        hidden ? 
        <></>
        :
        <ReactSelect
            className={getClassNames()}
            options={options}
            styles={getStyles()}
            isSearchable={isSearchable}
            isMulti={isMulti}
            isLoading={isLoading}
            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
            value={selected}
            form={form}
            name={name}
            placeholder={placeholder}
            loadingMessage={() => loadingMessage}
            noOptionsMessage={() => noOptionsMessage}
            required={required}
            onChange={handleSelect}
            components={{ DropdownIndicator: customDropdownIndicator }}
        />
    )

}

export default Select