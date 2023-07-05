import { ExpoGroupCreate } from "@utils/types"
import Image from "next/image"

import styles from "@styles/components/availability-ratio-reports/expo-groups-step.module.scss"
import Button from "@components/button"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"


interface Props {
    expoGroups: ExpoGroupCreate[]
    onChange: (expoGroups: ExpoGroupCreate[]) => void
    onNextStep: () => void
}

const ExpoGroupsStep = (
    {
        expoGroups,
        onChange,
        onNextStep
    }: Props
) => {

    // render

    return (
        <section className={styles.container}>
            <div className={styles.content}>
                <h3>Sélectionner et regrouper les expositions</h3>
                <p>Choisir les expositions et les groupes d’expositions pour lesquels le taux de disponibilité sera calculé.</p>
                <Button
                    onClick={onNextStep}
                    icon={faArrowRight}>
                    Générer le rapport
                </Button>
            </div>
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
        </section>
    )
}

export default ExpoGroupsStep