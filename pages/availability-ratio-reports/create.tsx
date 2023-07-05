
import DateRangeStep from "@components/availability-reports/date-range-step"
import { faChevronLeft, faCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/pages/availability-ratio-reports/create.module.scss"
import { DateRange } from "@utils/types"
import { useRouter } from "next/router"
import { useState } from "react"


const steps = [
    "Période",
    "Groupes d'expositions",
    "Résultats"
]

const CreateReport = () => {
    
    // state

    const [currentStep, setCurrentStep] = useState(0)

    const [dateRange, setDateRange] = useState<DateRange>({
        // startDate by default is the first day of the current month
        startDate: new Date(new Date().setDate(1)),
        // endDate by default is the first day of the next month
        endDate: new Date(new Date(new Date().setDate(1)).setMonth(new Date().getMonth() + 1))
    })

    // handlers

    const router = useRouter()

    const handleGoBack = () => {
        if(currentStep > 0) setCurrentStep(currentStep - 1)
        else router.push('/availability-ratio-reports')
    }

    // utils

    const getContent = () => {
        switch(currentStep) {
            case 0:
                return (
                    <DateRangeStep 
                        dateRange={dateRange}
                        onChange={setDateRange}
                        onNextStep={() => setCurrentStep(currentStep + 1)}
                    />
                )
            default:
                return <></>
        }
    }

    // render 

    return (
        <main id={styles.container}>
            <section className={styles.header}>
                <button
                    className={styles.goBackButton}
                    onClick={handleGoBack}>
                    <FontAwesomeIcon icon={faChevronLeft}/>
                </button>
                <div>
                    <h2>Nouveau rapport</h2>
                    <p>
                        <span>Etape {currentStep + 1}</span>
                        <FontAwesomeIcon icon={faCircle} />
                        <span>{steps[currentStep]}</span>
                    </p>
                </div>
            </section>
            {
                getContent()
            }
        </main>
    )
}

export default CreateReport