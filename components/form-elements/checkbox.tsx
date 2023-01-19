
import styles from "@styles/components/form-elements/checkbox.module.scss"
import { FormFieldProps } from "@utils/types";
import { ChangeEvent, MouseEvent } from "react";


const CheckBox = (
    {
        value,
        onChange
    }: FormFieldProps<boolean>
) => {

    const handleChange = (e: ChangeEvent | MouseEvent) => {
        e.preventDefault()
        onChange(!value)
    }

    const getClassNames = () => {
        let classNames = styles.checkbox
        classNames += value ? ' ' + styles.checked : ''
        return classNames
    }

    return (
        <>
            <input type="checkbox" hidden checked={value} onChange={handleChange} />
            <div className={getClassNames()} onClick={handleChange}>
                <span>p</span>
            </div>
        </>
    )
}

export default CheckBox