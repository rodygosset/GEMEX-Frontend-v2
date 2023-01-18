
import { faFileCirclePlus, faFileLines, faFolderOpen, faGem } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/layout/header.module.scss"
import { useRouter } from "next/router"
import LogOutButton from "@components/layout/header/log-out-button"
import UserCard from "./header/user-card"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import Button from "@components/button"
import CreateButton from "./header/create-button"
import Link from "next/link"


interface NavLink {
    icon: IconProp;
    text: string;
    onClick: () => void;
}

const Header = () => {

    const router = useRouter()

    // don't show the nav bar on specific routes

    const hiddenHeaderRoutes = [
        "/login",
        "/404"
    ]

    const shouldShowHeader = () => !hiddenHeaderRoutes.includes(router.pathname)

    
    const navLinks: NavLink[] = [
        {
            icon: faFolderOpen,
            text: "Mes fichiers",
            onClick: () => {}
        },
        {
            icon: faFileLines,
            text: "Mes fiches",
            onClick: () => {}
        },
        {
            icon: faFileCirclePlus,
            text: "Create",
            onClick: () => {}
        }
    ]

    return (
        shouldShowHeader() ?

        <header className={styles.header}>
            <Link href="/" className={styles.logoContainer}> 
                <FontAwesomeIcon icon={faGem} />
                GEMEX
            </Link>
            <nav>
                <ul>
                    {
                        navLinks.map(({icon, text, onClick}, index) => {
                            return (
                                <li key={index}>
                                    {
                                        text == "Create" ?
                                        <CreateButton/>
                                        :
                                        <Button
                                            icon={icon}
                                            role="tertiary"
                                            onClick={onClick}>
                                            {text}
                                        </Button>
                                    }
                                </li>
                            )
                        })
                    }
                    <li>
                        <UserCard/>
                    </li>
                    <li>
                        <LogOutButton/>
                    </li>
                </ul>
            </nav>
        </header>
        
        :
        
        <></>
    )
}

export default Header