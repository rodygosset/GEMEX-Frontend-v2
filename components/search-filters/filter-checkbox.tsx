import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/components/search-filters/filter-checkbox.module.scss"
import { FormFieldProps } from "@utils/types"
import { ChangeEvent, MouseEvent } from "react"

const FilterCheckBox = (
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
                <span>
                    <FontAwesomeIcon icon={faCheck}/>
                </span>
            </div>
        </>
    )

}


export default FilterCheckBox