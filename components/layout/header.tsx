
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
import { useSession } from "next-auth/react"
import { MySession } from "@conf/utility-types"
import { useContext } from "react"
import { Context } from "@utils/context"


interface NavLink {
    icon: IconProp;
    text: string;
    link?: string;
    onClick: () => void;
}

const Header = () => {

    const router = useRouter()

    const session = useSession()

    const user = (session.data as MySession)?.user

    // don't show the nav bar on specific routes

    const hiddenHeaderRoutes = [
        "/login",
        "/404",
        "/401"
    ]

    const { navHistory } = useContext(Context)

    const shouldShowHeader = () => (
        !hiddenHeaderRoutes.includes(router.pathname) &&
        navHistory[navHistory.length - 1] != "/401"
    )

    
    const navLinks: NavLink[] = [
        {
            icon: faFolderOpen,
            text: "Mes fichiers",
            onClick: () => {}
        },
        {
            icon: faFileLines,
            text: "Mes fiches",
            link: `/search?item=fiches&auteur_id=${user?.id}`,
            onClick: () => router.push(`/search?item=fiches&auteur_id=${user?.id}`)
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
                        navLinks.map(({icon, text, link, onClick}, index) => {
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
                                        {
                                            link ?
                                            <Link href={link}>{text}</Link>
                                            :
                                            text
                                        }
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