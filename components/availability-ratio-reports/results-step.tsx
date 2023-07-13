import { RapportTauxDisponibilite, rapportToCSV } from "@conf/api/data-types/rapport";
import Image from "next/image";

import styles from "@styles/components/availability-ratio-reports/results-step.module.scss";
import LoadingIndicator from "@components/utils/loading-indicator";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons";
import BarChart from "@components/charts/bar-chart";
import Select from "@components/form-elements/select";
import { useEffect, useState } from "react";
import { Fiche } from "@conf/api/data-types/fiche";
import useAPIRequest from "@hook/useAPIRequest";
import { useSession } from "next-auth/react";
import { MySession } from "@conf/utility-types";
import SearchResultCard from "@components/cards/search-result-card";
import { useGetMetaData } from "@hook/useGetMetaData";
import { SearchResultsMetaData } from "@conf/api/search";

interface Props {
    report: RapportTauxDisponibilite | null
}

const ResultsStep = (
    {
        report
    }: Props
) => {

    // state

    const [selectedGroup, setSelectedGroup] = useState<string>()
    const [selectedExpo, setSelectedExpo] = useState<number>()

    const [failureReports, setFailureReports] = useState<Fiche[]>([])
    const [metaData, setMetaData] = useState<SearchResultsMetaData>({})

    const getSelectedGroup = () => {
        if(!report || !selectedGroup) return
        return report.groupes_expositions.find(group => group.nom === selectedGroup)
    }

    const getSelectedExpo = () => {
        if(!report || !selectedGroup || !selectedExpo) return
        return getSelectedGroup()?.expositions.find(expo => expo.exposition_id === selectedExpo)
    }

    // effects

    // get failure reports when selectedExpo changes
    // by making a request to the API

    const makeAPIRequest = useAPIRequest()

    const session = useSession().data as MySession | null

    useEffect(() => {
        if(!report || !selectedGroup || !selectedExpo || !session) return

        makeAPIRequest<Fiche[], void>(
            session,
            "post",
            "fiches",
            "search/",
            {
                "exposition_id": selectedExpo,
                "date_debut": report.date_debut,
                "date_fin": report.date_fin,
                "tags": ["Panne"]
            },
            res => setFailureReports(res.data)
        )

    }, [selectedExpo])

    // set selectedExpo to undefined when selectedGroup changes

    useEffect(() => {
        setSelectedExpo(undefined)
    }, [selectedGroup])

    // get the metadata for the failure reports when they change

    const getMetaData = useGetMetaData()

    useEffect(() => {
        if(!session) return

        getMetaData(session, "fiches", failureReports).then(metaData => {
            if(metaData) setMetaData(metaData)
            else setMetaData({})
        })
    }, [failureReports, session])


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
                <div className={styles.chartContainer}>  
                    <BarChart
                        data={report.groupes_expositions.map(group => group.taux)}
                        labels={report.groupes_expositions.map(group => group.nom)}
                        label="Taux de panne par groupe d'expositions"
                    />
                </div>
                <div className={styles.selectSectionHeader}>
                    <h4>Taux de panne par exposition</h4>
                    <Select
                        name="groupes_expositions"
                        options={report.groupes_expositions.map(group => ({
                            label: group.nom,
                            value: group.nom
                        }))}
                        value={selectedGroup}
                        onChange={setSelectedGroup}
                    />
                </div>
                {
                    report.groupes_expositions.length > 0 && selectedGroup ?
                    <>
                        <div className={styles.chartContainer}>  
                            <BarChart
                                data={getSelectedGroup()?.expositions.map(expo => expo.taux) || []}
                                labels={getSelectedGroup()?.expositions.map(expo => expo.nom) || []}
                                label="Taux de panne par exposition"
                            />
                        </div>
                        <div className={styles.selectSectionHeader}>
                            <h4>Fiches panne par exposition</h4>
                            <Select
                                name="expositions"
                                options={getSelectedGroup()?.expositions.map(expo => ({
                                    label: expo.nom,
                                    value: expo.exposition_id
                                })) || []}
                                value={selectedExpo}
                                onChange={setSelectedExpo}
                            />
                        </div>
                        {
                            selectedExpo && failureReports.length > 0 ?
                            <ul className={styles.failureReports}>
                            {
                                failureReports.map((failureReport, index) => (
                                    <SearchResultCard
                                        key={`failure-report-${index}`}
                                        itemType={"fiches"}
                                        data={failureReport}
                                        globalMetaData={metaData}
                                        listView
                                    />
                                ))
                            }
                            </ul>
                            :
                            <p className={styles.noData}>Aucune donnée disponible...</p>
                        }
                    </>
                    : 
                    <p className={styles.noData}>Aucune donnée disponible...</p>
                }
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
                        <span>Télécharger les résultats</span>
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