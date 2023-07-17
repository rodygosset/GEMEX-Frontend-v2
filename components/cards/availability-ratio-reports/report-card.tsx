import { RapportTauxDisponibilite } from "@conf/api/data-types/rapport"
import { faChartSimple, faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styles from "@styles/components/cards/availability-ratio-reports/report-card.module.scss"
import Link from "next/link";
import { useRouter } from "next/router";

interface Props {
    report: RapportTauxDisponibilite;
}

const ReportCard = ({ report }: Props) => {

    // utils

    const getRatioClassNames = () => {
        let ratio = 100 - report.taux
        if (ratio >= 99) {
            return styles.high
        } else if (ratio >= 95) {
            return styles.medium
        } else {
            return styles.low
        }
    }

    const toLocaleDateString = (date: string) => {
        const dateObj = new Date(date)
        return dateObj.toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    }

    const getGroupes = () => report.groupes_expositions.map(groupe => groupe.nom).join(" - ")

    // render

    return (
        <li>
            <Link
                className={styles.card} 
                href={`/availability-ratio-reports/view/${report.id}`}>
                <p className={styles.header}>
                    <span>
                        <FontAwesomeIcon icon={faChartSimple} /> &nbsp;
                        {toLocaleDateString(report.date_debut)}
                    </span>
                    <span className={styles.hr}></span>
                    <span>
                        {toLocaleDateString(report.date_fin)}
                    </span>
                </p>
                <div className={styles.ratio + " " + getRatioClassNames()}>
                    <hr />
                    <p>{(100 - report.taux).toFixed(2)}%</p>
                    <hr />
                </div>
                <p className={styles.groupes}>{getGroupes()}</p>
            </Link>
        </li>
    )
}

export default ReportCard