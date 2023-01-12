import Button from "@components/button"
import { faHome } from "@fortawesome/free-solid-svg-icons"
import styles from "@styles/pages/404.module.scss"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"

const My404 = () => {

    const router = useRouter()


    return (
        <div className={styles.container}>
            <div className={styles.illustrationContainer}>
                <Image 
                    quality={100}
                    src={'/images/404-illustration.svg'} 
                    alt={"Erreur 404."} 
                    priority
                    fill
                    style={{ 
                        objectFit: "contain", 
                        top: "auto"
                    }}
                />
            </div>
            <h1>Oups !</h1>
            <p>Cette page n’existe pas... :-(</p>
            <Button 
                icon={faHome}
                role="secondary"
                bigPadding
                onClick={() => {}}>
                <Link href="/">Retourner à l'accueil</Link>
            </Button>
        </div>
    )
}

export default My404