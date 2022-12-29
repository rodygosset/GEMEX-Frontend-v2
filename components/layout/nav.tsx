
import { faGem } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/layout/nav.module.scss"
import { useRouter } from "next/router"

const Nav = () => {

    const router = useRouter()


    // don't show the nav bar on specific routes

    const hiddenNavRoutes = [
        "/login"
    ]

    const shouldShowNav = () => !hiddenNavRoutes.includes(router.pathname)

    return (
        shouldShowNav() ?

        <nav className={styles.nav}>
            <div className={styles.logoContainer}>  
                <FontAwesomeIcon icon={faGem} />
                <p>GEMEX</p>
            </div>
        </nav>
        
        :
        
        <></>
    )
}

export default Nav