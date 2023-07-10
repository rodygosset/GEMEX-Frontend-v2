import { DateRange } from "@utils/types"
import Image from "next/image"

import styles from "@styles/components/availability-ratio-reports/expo-groups-step.module.scss"
import Button from "@components/button"
import { faArrowRight, faArrowRotateLeft, faPlus } from "@fortawesome/free-solid-svg-icons"
import ExpoGroupForm from "@components/forms/expo-group-form"
import ExpoGroupCard from "@components/cards/expo-group-card"
import { useState } from "react"
import { ExpoGroupCreate } from "@conf/api/data-types/rapport"
import PreviousExpoGroupsPickerModal from "@components/modals/availability-ratio-reports/previous-expo-groups-picker-modal"


interface Props {
    expoGroups: ExpoGroupCreate[]
    dateRange: DateRange
    onChange: (expoGroups: ExpoGroupCreate[]) => void
    onNextStep: () => void
}

const ExpoGroupsStep = (
    {
        expoGroups,
        dateRange,
        onChange,
        onNextStep
    }: Props
) => {

    // state

    const [showForm, setShowForm] = useState(false)
    

    // manage previous groups modal

    const [showPreviousGroupsModal, setShowPreviousGroupsModal] = useState(false)

    // render

    return (
        <>
            <section className={styles.container}>
                <div className={styles.content}>
                    <h3>Sélectionner et regrouper les expositions</h3>
                    <p>Choisir les expositions et les groupes d’expositions pour lesquels le taux de disponibilité sera calculé.</p>                

                    {
                        expoGroups.length > 0 ? 
                        <ul>
                            {expoGroups.map((expoGroup, index) => (
                                <ExpoGroupCard
                                    // combine nom & id to make a unique key 
                                    key={`${expoGroup.nom}-${index}-${expoGroup.expositions.map(expo => expo.id).join("-")}`}
                                    expoGroup={expoGroup}
                                    onChange={expoGroup => {
                                        const index = expoGroups.findIndex(group => group.nom === expoGroup.nom)
                                        const newExpoGroups = [...expoGroups]
                                        newExpoGroups[index] = expoGroup    
                                        onChange(newExpoGroups)
                                    }}
                                    onDelete={() => onChange(expoGroups.filter(group => group.nom !== expoGroup.nom))}
                                />
                            ))}
                        </ul> 
                        :
                        <p className={styles.accentColorMessage}>Aucun groupe d'expositions sélectionné.</p>
                    }

                    {
                        showForm ?
                        <ExpoGroupForm 
                            onSubmit={expoGroup => onChange([...expoGroups, expoGroup])} 
                            onClose={() => setShowForm(false)}
                        /> : <></>
                    }

                    {
                        !showForm ?
                        <div className={styles.buttonsContainer}>
                            <Button
                                fullWidth
                                className={styles.previousButton}
                                role="tertiary"
                                onClick={() => setShowPreviousGroupsModal(true)}
                                icon={faArrowRotateLeft}>
                                    Groupes précédents
                            </Button>
                            <Button
                                fullWidth
                                role="secondary"
                                onClick={() => setShowForm(true)}
                                icon={faPlus}>
                                Nouveau groupe
                            </Button>
                        </div> 
                        : <></>
                    }
                    
                    {
                        expoGroups.length == 0 ?
                        <p>Créez au minimum un groupe d'exposition avant de pouvoir générer un rapport.</p>
                        : <></>
                    }

                    <p className={styles.accentColorMessage}>La période sélectionnée est du {dateRange.startDate.toLocaleDateString()} au {dateRange.endDate.toLocaleDateString()}.</p>
                    

                    <Button
                        active={expoGroups.length > 0}
                        onClick={onNextStep}
                        icon={faArrowRight}>
                        Générer le rapport
                    </Button>
                </div>
                <div className={styles.stickyWrapper}>
                    <div className={styles.illustrationContainer}>
                        <Image
                            src="/images/data-points-illustration.svg"
                            alt="Groupes d'expositions"
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
            <PreviousExpoGroupsPickerModal
                isVisible={showPreviousGroupsModal}
                closeModal={() => setShowPreviousGroupsModal(false)}
                expoGroups={expoGroups}
                onChange={onChange}
            />
        </>
    )
}

export default ExpoGroupsStep