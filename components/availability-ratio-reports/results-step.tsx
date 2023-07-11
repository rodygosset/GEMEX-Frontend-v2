import { RapportTauxDisponibilite, rapportToCSV } from "@conf/api/data-types/rapport";
import Image from "next/image";

import styles from "@styles/components/availability-ratio-reports/results-step.module.scss";
import LoadingIndicator from "@components/utils/loading-indicator";
import { useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons";

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

    const getLinkToCSV = () => {
        if(!report || report.taux === null) return ""
        const csv = "data:text/csv;charset=utf-8," + rapportToCSV(report)
        return encodeURI(csv)
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
                <div className={styles.buttonsContainer}>
                    <Link 
                        className={styles.secondary}
                        passHref
                        href="/availability-ratio-reports">
                            <FontAwesomeIcon icon={faArrowLeft} />
                        <span>Accueil</span>
                    </Link>
                    <Link
                        className={styles.primary}
                        passHref
                        download={`rapport-${toLocaleDateString(report.date_debut)}-${toLocaleDateString(report.date_fin)}.csv`}
                        href={getLinkToCSV()}>
                        <FontAwesomeIcon icon={faDownload} />
                        <span>Télécharger le rapport</span>
                    </Link>
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