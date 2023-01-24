
import styles from "@styles/components/form-elements/text-input.module.scss"
import { FormFieldProps } from "@utils/types";
import { ChangeEvent } from "react";


interface Props {
    placeholder?: string;
    onChange: (newValue: string) => void;
    name?: string;
    defaultValue?: string;
    currentValue?: string;
    bigPadding?: boolean;
    password?: boolean;
    fullWidth?: boolean;
}

const TextInput = ({ 
        placeholder, 
        onChange, 
        name,
        defaultValue, 
        currentValue, 
        bigPadding, 
        password,
        fullWidth
    }: Props) => {

    const getClassNames = () => {
        let classNames =  styles.textInput 
        classNames += (bigPadding ? ' ' + styles.bigPadding : '') 
        classNames += (fullWidth ? ' ' + styles.fullWidth : '')
        return classNames
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault()
        onChange(event.target.value)
    }

    return (
        <input 
            className={getClassNames()}
            name={name ? name : undefined}
            type={password ? "password" : "text"}
            placeholder={placeholder ? placeholder : undefined}
            onChange={handleChange}
            defaultValue={defaultValue ? defaultValue : undefined}
            value={currentValue}
        />
    )
}

export default TextInput