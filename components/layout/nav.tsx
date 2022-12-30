
import Button from "@components/button"
import { faGem, faRightFromBracket } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/layout/nav.module.scss"
import { signOut } from "next-auth/react"
import { useRouter } from "next/router"

const Nav = () => {

    const router = useRouter()

    const handleLogOut = () => signOut({ callbackUrl: '/login' })


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

            <Button 
                role="tertiary" 
                status="discouraged" 
                icon={faRightFromBracket} 
                onClick={handleLogOut}>
                    Déconnexion
            </Button>
        </nav>
        
        :
        
        <></>
    )
}

export default Nav