
import Button from "@components/button"
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/pages/availability-ratio-reports/index.module.scss"
import Image from "next/image"
import Link from "next/link"

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
                <div className={styles.links}>
                    <Link
                        className={styles.secondaryLink}
                        href="/availability-ratio-reports/search"
                        passHref>
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>Rapports précédents</span>
                    </Link>
                    <Link
                        className={styles.primaryLink}
                        href="/availability-ratio-reports/create"
                        passHref>
                            <FontAwesomeIcon icon={faArrowRight} />
                            <span>Nouveau rapport</span>
                    </Link>
                </div>
            </section>
        </main>
    )

}

export default Index