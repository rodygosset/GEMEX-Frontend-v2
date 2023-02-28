
import styles from "@styles/components/form-elements/date-input.module.scss"
import { capitalizeEachWord, dateOptions, frenchToISO } from "@utils/general";

// custom components

import React from "react";
import { MouseEventHandler } from "react";

// date input

interface InputProps {
    value: string;
    showLocaleDate: boolean;
    onClick: MouseEventHandler;
}

export const CustomInput = React.forwardRef((
    {
        value,
        showLocaleDate,
        onClick
    }: InputProps,
    ref: React.LegacyRef<HTMLParagraphElement>
) => {

    const getDateString = () => {

        const date = new Date(frenchToISO(value))
        return (
            showLocaleDate ? 
            capitalizeEachWord(date.toLocaleDateString('fr-fr', dateOptions))
            :
            value
        )
    }

    return (
        <p className={styles.dateInput} onClick={onClick} ref={ref}>
            { getDateString() }
        </p>
    )
})