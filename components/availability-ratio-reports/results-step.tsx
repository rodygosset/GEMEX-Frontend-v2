import { RapportTauxDisponibilite, rapportToCSV } from "@conf/api/data-types/rapport";
import Image from "next/image";

import styles from "@styles/components/availability-ratio-reports/results-step.module.scss";
import LoadingIndicator from "@components/utils/loading-indicator";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload, faTrash } from "@fortawesome/free-solid-svg-icons";
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
import Button from "@components/button";
import DeleteDialog from "@components/modals/delete-dialog";
import { useRouter } from "next/router";

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

    const [expoGroupsChartLink, setExpoGroupsChartLink] = useState<string>("#")
    const [exposChartLink, setExposChartLink] = useState<string>("#")

    // handlers

    const handleGroupChartDownload = () => {
        if(!report) return
        const link = document.createElement("a")
        link.href = expoGroupsChartLink
        link.download = `taux-panne-par-groupe-d-expositions-${report.date_debut}-${report.date_fin}.png`
        link.click()
    }

    const handleExposChartDownload = () => {
        if(!report) return
        const link = document.createElement("a")
        link.href = exposChartLink
        link.download = `taux-panne-par-expo-groupe-${selectedGroup}-${report.date_debut}-${report.date_fin}.png`
        link.click()
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

    const getRatioClassNames = (ratio: number) => {
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

    // manage deletion modal

    const router = useRouter()

    const userRole = session?.userRole

    const [showDeletionModal, setShowDeletionModal] = useState<boolean>(false)

    // render

    return report !== null && report.taux !== null ? (
        <>
            <section className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h3>Résultats</h3>
                        <p>Pour la période allant du <strong>{toLocaleDateString(report.date_debut)}</strong> au <strong>{toLocaleDateString(report.date_fin)}</strong></p>
                    </div>
                    <ul className={styles.groupResults}>
                    {
                        report.groupes_expositions.map((group, index) => (
                            <li key={`groupe-${group.nom}-${index}`}>
                                <h4>{group.nom}</h4>
                                <p className={getRatioClassNames(100 - group.taux)}>
                                {(100 - group.taux).toFixed(2)}%
                                </p>
                            </li>
                        ))
                    }
                    </ul>
                    <div className={styles.chartContainer}>  
                        <div className="relative w-full min-[992px]:w-[600px] min-[1024px]:w-full h-[300px] min-h-[300px] max-[992px]:h-[400px] max-[992px]:min-h-[400px]">
                            <BarChart
                                data={report.groupes_expositions.map(group => group.taux)}
                                labels={report.groupes_expositions.map(group => group.nom)}
                                label="Taux de panne par groupe d'expositions"
                                onDownloadLinkReady={setExpoGroupsChartLink}
                            />
                        </div>
                        <Button 
                            icon={faDownload}
                            role="secondary"
                            onClick={handleGroupChartDownload}
                        >
                            Télécharger l'image
                        </Button>
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
                                <div className="relative w-full flex-1 h-[400px]">
                                    <BarChart
                                        data={getSelectedGroup()?.expositions.map(expo => expo.taux) || []}
                                        labels={getSelectedGroup()?.expositions.map(expo => expo.nom) || []}
                                        label="Taux de panne par exposition"
                                        onDownloadLinkReady={setExposChartLink}
                                    />
                                </div>
                                <Button
                                    icon={faDownload}
                                    role="secondary"
                                    onClick={handleExposChartDownload}
                                >
                                    Télécharger l'image
                                </Button>
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
                        {
                            userRole?.suppression.includes("rapports") ?
                            <Button
                                className={styles.deleteButton}
                                icon={faTrash}
                                status="danger"
                                role="tertiary"
                                onClick={() => setShowDeletionModal(true)}>
                                Supprimer le rapport
                            </Button>
                            : <></>
                        }

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
            {
                userRole?.suppression.includes("rapports") ?
                <DeleteDialog
                    itemType="rapports"
                    itemTitle={`rapport du ${toLocaleDateString(report.date_debut)} au ${toLocaleDateString(report.date_fin)}`}
                    customItemID={`id/${report.id}`}
                    isVisible={showDeletionModal}
                    closeDialog={() => setShowDeletionModal(false)}
                    onSuccess={() => router.push("/availability-ratio-reports/search")}
                />
                : <></>
            }
        </>
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