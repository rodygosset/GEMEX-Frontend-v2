import { DateFormat, DateRange } from "@utils/types"

import styles from "@styles/components/availability-ratio-reports/date-range-step.module.scss"
import Image from "next/image"
import { useState } from "react"
import DateInput from "@components/form-elements/date-input"
import FieldContainer from "@components/form-elements/field-container"
import Label from "@components/form-elements/label"
import Button from "@components/button"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"

interface Props {
    dateRange: DateRange;
    onChange: (newDateRange: DateRange) => void;
    onNextStep: () => void;
}

const DateRangeStep = (
    {
        dateRange,
        onChange,
        onNextStep
    }: Props
) => {

    // handlers

    const handleStartDateChange = (newStartDate: Date) => {
        onChange({
            ...dateRange,
            startDate: newStartDate
        })
    }

    const handleEndDateChange = (newEndDate: Date) => {
        onChange({
            ...dateRange,
            endDate: newEndDate
        })
    }

    // render

    return (
        <section className={styles.container}>
            <div className={styles.illustrationContainer}>
                <Image
                    src="/images/time-illustration.svg"
                    alt="Période de temps"
                    priority
                    fill
                    style={{ 
                        objectFit: "contain", 
                        top: "auto"
                    }}
                />
            </div>
            <div className={styles.content}>
                <h3>Choisir une période</h3>
                <p>
                    Sélectionnez une période de temps pour laquelle vous souhaitez générer un rapport.
                </p>
                <form
                    onSubmit={e => e.preventDefault()} 
                    className={styles.fieldsContainer}>
                    <FieldContainer>
                        <Label>Début</Label>
                        <DateInput
                            name="start-date"
                            value={dateRange.startDate}
                            onChange={handleStartDateChange}
                            strict={false}
                            
                        />
                    </FieldContainer>
                    
                    <FieldContainer>
                        <Label>Fin</Label>
                        <DateInput
                            name="end-date"
                            value={dateRange.endDate}
                            onChange={handleEndDateChange}
                            minDate={dateRange.startDate}
                            strict={false}
                            
                        />
                    </FieldContainer>
                </form>
                <p className={styles.dateRangeInfo}>La période sélectionnée est du {dateRange.startDate.toLocaleDateString("fr-FR")} au {dateRange.endDate.toLocaleDateString("fr-FR")}.</p>
                <Button
                    onClick={onNextStep}
                    icon={faArrowRight}>
                    Etape suivante
                </Button>
            </div>
        </section>
    )
}

export default DateRangeStep