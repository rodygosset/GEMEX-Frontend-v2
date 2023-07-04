
import { faChartSimple, faFileCirclePlus, faFileLines, faFolderOpen, faGem, faUsers } from "@fortawesome/free-solid-svg-icons"
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
import { useContext, useEffect, useState } from "react"
import { Context } from "@utils/context"
import FilePicker from "@components/modals/file-picker"


interface NavLink {
    icon: IconProp;
    text: string;
    link?: string;
    onClick: () => void;
}

const Header = () => {

    const router = useRouter()

    const session = useSession()

    const user = (session.data as MySession | null)?.user
    const userRole = (session.data as MySession | null)?.userRole

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

    // manage file explorer

    const [showFileExplorer, setShowFileExplorer] = useState(false)

    // link to be displayed in the nav

    const shouldShowManageLink = () => (
        userRole && userRole.permissions.includes("manage") &&
        !router.pathname.includes("user-management-dashboard")
    )

    const shouldShouldAvailabilityRatioModuleLink = () => (
        userRole && userRole.permissions.includes("manage") &&
        !router.pathname.includes("availability-ratio")
    )


    const manageUsersLink: NavLink = {
        icon: faUsers,
        text: "Utilisateurs",
        link: "/user-management-dashboard",
        onClick: () => router.push("/user-management-dashboard")
    }

    const availabilityRationModuleLink: NavLink = {
        icon: faChartSimple,
        text: "Taux de disponibilité",
        link: "/availability-ratio",
        onClick: () => router.push("/availability-ratio")
    }
    
    const navLinks: NavLink[] = [
        // only show the link to the user management page if the user's a manager
        ... shouldShowManageLink() ? [manageUsersLink] : [],
        // only show the link to the availability ratio module if the user's a manager
        ... shouldShouldAvailabilityRatioModuleLink() ? [availabilityRationModuleLink] : [],
        {
            icon: faFolderOpen,
            text: "Mes fichiers",
            onClick: () => setShowFileExplorer(true)
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
    // render

    return (
        shouldShowHeader() ?

        <>
            <header className={styles.header}>
                <Link href="/" className={styles.logoContainer}> 
                    <FontAwesomeIcon icon={faGem} />
                    GEMEX
                </Link>
                <nav>
                    <ul className={styles.navList}>
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
            <FilePicker 
                isVisible={showFileExplorer}
                closeModal={() => setShowFileExplorer(false)}
                isExplorer
            />
        </>
        
        :
        
        <></>
    )
}

export default Header