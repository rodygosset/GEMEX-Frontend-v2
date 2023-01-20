
import Button from "@components/button";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
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


// header

interface HeaderProps {
    date: Date;
    changeYear: (value: string) => void;
    changeMonth: (value: string) => void;
    decreaseMonth: MouseEventHandler;
    increaseMonth: MouseEventHandler;
    prevMonthButtonDisabled: boolean;
    nextMonthButtonDisabled: boolean;
}

const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Decembre",
  ];

export const CustomHeader = (
    {
        date,
        changeYear,
        changeMonth,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
    }: HeaderProps
) => {

    // todo

    return (
        <div className={styles.header}>
            <Button 
                onClick={decreaseMonth}
                role="tertiary"
                animateOnHover={false}
                icon={faChevronLeft}>
            </Button>
            <select>
                // todo
            </select>
            <Button 
                onClick={increaseMonth}
                role="tertiary"
                animateOnHover={false}
                icon={faChevronRight}>
            </Button>
        </div>
    )
}