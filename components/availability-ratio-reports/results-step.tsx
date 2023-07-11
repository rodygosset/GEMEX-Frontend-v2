import { RapportTauxDisponibilite } from "@conf/api/data-types/rapport";
import Image from "next/image";

import styles from "@styles/components/availability-ratio-reports/results-step.module.scss";
import LoadingIndicator from "@components/utils/loading-indicator";

interface Props {
    report: RapportTauxDisponibilite | null
}

const ResultsStep = (
    {
        report
    }: Props
) => {

    // utils 

    const toLocaleDateString = (date: string) => new Date(date).toLocaleDateString("fr-FR")

    const getAvailabilityRatio = () => report ? 100 - report.taux : 0

    const getRatioClassNames = () => {
        let ratio = getAvailabilityRatio()
        if (ratio >= 99) {
            return styles.high
        } else if (ratio >= 95) {
            return styles.medium
        } else {
            return styles.low
        }
    }

    // render

    return report !== null && report.taux !== null ? (
        <section className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h3>Résultats</h3>
                    <p>Pour la période allant du <strong>{toLocaleDateString(report.date_debut)}</strong> au <strong>{toLocaleDateString(report.date_fin)}</strong></p>
                </div>
                <div className={styles.globalResult}>
                    <h4>Taux de disponibilité global</h4>
                    <p className={getRatioClassNames()}>
                    {getAvailabilityRatio().toFixed(2)}%
                    </p>
                </div>
            </div>
            <div className={styles.stickyWrapper}>
                    <div className={styles.illustrationContainer}>
                        <Image
                            src="/images/data-report-illustration.svg"
                            alt="Rapport de données"
                            priority
                            fill
                            style={{
                                objectFit: "contain",
                                top: "auto"
                            }}
                        />
                    </div>
                </div>
        </section>
    ) 
    : 
    <section className={styles.placeholder}>
        <LoadingIndicator/>
        <div className={styles.content}>
            <p>Calculs en cours...</p>
        </div>
    </section>
}

export default ResultsStep