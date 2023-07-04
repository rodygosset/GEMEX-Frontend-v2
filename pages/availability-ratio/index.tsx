
import Button from "@components/button"
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import styles from "@styles/pages/availability-ratio/index.module.scss"
import Image from "next/image"

const Index = () => {


    // render 

    return (
        <main id={styles.container}>
            <div className={styles.illustrationContainer}>
                <Image 
                    className={styles.imageHover}
                    quality={100}
                    src={'/images/data-illustration.svg'} 
                    alt={"Données"} 
                    priority
                    fill
                    style={{ 
                        objectFit: "contain", 
                        top: "auto"
                    }}
                />
            </div>
            <section>
                <h1>Taux de disponibilité</h1>
                <p>Calculer, exporter et sauvegarder des rapports de taux de disponibilité du musée sur des périodes spécifiques.</p>
                <div className={styles.buttonsContainer}>
                    <Button
                        icon={faArrowLeft}
                        role="secondary"
                        onClick={() => {}}>
                            Rapports précédents
                    </Button>
                    <Button
                        icon={faArrowRight}
                        role="primary"
                        onClick={() => {}}>
                            Nouveau rapport
                    </Button>
                </div>
            </section>
        </main>
    )

}

export default Index