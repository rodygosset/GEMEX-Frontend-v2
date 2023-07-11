import { ExpoGroup, ExpoGroupCreate, RapportTauxDisponibilite } from "@conf/api/data-types/rapport";
import ModalContainer from "../modal-container";

import styles from "@styles/components/modals/availability-ratio-reports/previous-expo-groups-picker-modal.module.scss"
import Button from "@components/button";
import { useEffect, useState } from "react";
import useAPIRequest from "@hook/useAPIRequest";
import { useSession } from "next-auth/react";
import { MySession } from "@conf/utility-types";
import ExpoGroupCard from "@components/cards/expo-group-card";
import HorizontalSeperator from "@components/utils/horizontal-seperator";
import Image from "next/image";

interface Props {
    isVisible: boolean;
    closeModal: () => void;
    expoGroups: ExpoGroupCreate[];
    onChange: (expoGroups: ExpoGroupCreate[]) => void;
}

const PreviousExpoGroupsPickerModal = (
    {
        isVisible,
        closeModal,
        expoGroups,
        onChange
    }: Props
) => {

    // state

    const [reports, setReports] = useState<RapportTauxDisponibilite[]>([])

    const [selectedExpoGroups, setSelectedExpoGroups] = useState<ExpoGroup[]>([])

    // get the three last created reports from the API

    const makeAPIRequest = useAPIRequest()

    const session = useSession().data as MySession | null

    useEffect(() => {

        if(!session || reports.length > 0) return

        makeAPIRequest<RapportTauxDisponibilite[], void>(
            session,
            "get",
            "rapports",
            "?max=3",
            undefined,
            res => setReports(res.data)
        )

    }, [session])

    // handlers

    const handleToggleSelect = (expoGroup: ExpoGroup) => {
        const index = selectedExpoGroups.findIndex(group => group.id === expoGroup.id)
        if(index === -1) {
            setSelectedExpoGroups([...selectedExpoGroups, expoGroup])
        } else setSelectedExpoGroups(selectedExpoGroups.filter(group => group.id !== expoGroup.id))
    }

    const handleSubmit = () => {
        onChange([...expoGroups, ...selectedExpoGroups.map(group => ({
            nom: group.nom,
            expositions: group.expositions.map(expo => ({id: expo.id, nom: expo.nom}))
            }))
        ])
        closeModal()
        setSelectedExpoGroups([])
    }

    // utils

    const toDateString = (date: string) => (new Date(date)).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric"
    })

    // render

    return (
        <ModalContainer isVisible={isVisible}>
            <section className={styles.modal}>
                <div className={styles.header}>
                    <h2>Groupes précédents</h2>
                    <p>Séléctionner des groupes créés lors de rapports précédents.</p>
                </div>
                {
                    reports.length > 0 ?
                    <ul className={styles.reportList}>
                    {
                        reports.map((report, index) => (
                            <li
                                key={`${report.id}-${index}`}
                                className={styles.groupListContainer}>
                                <h3>Rapport allant du {toDateString(report.date_debut)} au {toDateString(report.date_fin)}</h3>
                                <ul className={styles.groupList}>
                                {
                                    report.groupes_expositions.map((group, index) => (
                                        <ExpoGroupCard
                                            key={`${group.nom}-${index}`}
                                            expoGroup={{
                                                nom: group.nom,
                                                expositions: group.expositions.map(expo => ({
                                                    id: expo.id,
                                                    nom: expo.nom || expo.id.toString()
                                                }))
                                            }}
                                            onToggleSelect={() => handleToggleSelect(group)}
                                            isSelected={selectedExpoGroups.findIndex(expoGroup => expoGroup.id === group.id) !== -1}
                                            selectMode
                                        />
                                    ))


                                }
                                </ul>
                            </li>
                        ))
                    }
                    </ul>
                    : 
                    <div className={styles.noReportContainer}>
                        <div className={styles.illustrationContainer}>
                            <Image
                                src="/images/no-results-illustration.svg"
                                alt="Aucun rapport précédent"
                                quality={100}
                                priority
                                fill
                                style={{ 
                                    objectFit: "contain", 
                                    top: "auto"
                                }}
                            />
                        </div>
                        <h3>Aucun rapport précédent</h3>
                        <p>Vous n'avez pas encore créé de rapport.</p>
                    </div>

                }
                <div className={styles.buttonsContainer}>
                    <Button 
                        onClick={() => closeModal()}
                        role="secondary">
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}>
                        Valider
                    </Button>
                </div>
            </section>
        </ModalContainer>
    )
}

export default PreviousExpoGroupsPickerModal