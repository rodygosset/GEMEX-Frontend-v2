
import styles from "@styles/components/form-elements/date-input.module.scss"

// custom components

import React from "react";
import { MouseEventHandler } from "react";

// date input

interface InputProps {
    value: any;
    onClick: MouseEventHandler;
}

export const CustomInput = React.forwardRef((
    {
        value,
        onClick
    }: InputProps,
    ref: React.LegacyRef<HTMLParagraphElement>
) => {

    return (
        <p className={styles.dateInput} onClick={onClick} ref={ref}>{ value }</p>
    )
})