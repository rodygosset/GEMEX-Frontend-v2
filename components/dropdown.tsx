import styles from "@styles/components/dropdown.module.scss"
import { useState } from "react";


interface Props {
    children: any;
    listItems: string[];
    className?: string;
    onSelect?: (newValue: string) => void
}

const Dropdown = (
    {
        children,
        listItems,
        className,
        onSelect
    }: Props
) => {


    // state

    const [showDropdown, setShowDropdown] = useState(false)

    const toggleDropdownVisibility = () => setShowDropdown(!showDropdown)

    // utils

    const getClassNames = () => {
        let classNames = styles.container
        classNames += className ? ' ' + className : ''
        return classNames
    }

    const getDropdownClassNames = () => {
        let classNames = styles.dropdown
        classNames += showDropdown ? '' : ' ' + styles.hidden
        return classNames
    }

    // handlers

    const handleSelect = (newValue: string) => {
        if(onSelect) onSelect(newValue)
    }

    // render

    return (
        <div className={getClassNames()} onClick={() => toggleDropdownVisibility()}>
            { children }
            <ul className={getDropdownClassNames()}>
            {
                listItems.map(item => (
                    <li 
                        key={item}
                        onClick={() => handleSelect(item)}>
                        {item}
                        </li>
                ))
            }
            </ul>
        </div>
        
    )
}


export default Dropdown