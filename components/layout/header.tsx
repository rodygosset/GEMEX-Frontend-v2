
import { faChartSimple, faFileAlt, faFileCirclePlus, faFileLines, faFolderOpen, faGem, faHome, faUsers } from "@fortawesome/free-solid-svg-icons"
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
import { useContext, useState } from "react"
import { Context } from "@utils/context"
import FilePicker from "@components/modals/file-picker"
import { NavMenu, NavMenuItem, NavMenuItemType } from "@components/radix/nav-menu"
import { NavItem, NavSheet } from "@components/radix/nav-sheet"
import { creatableItemsList } from "@conf/general"




const Header = () => {

    const router = useRouter()

    const session = useSession()

    const user = (session.data as MySession | null)?.user
    const userRole = (session.data as MySession | null)?.userRole

    // if the user doesn't have create permission on any of the items above
    // or on Fiche objects
    // don't show the create button

    const getAuthorizedCreatableItems = () => {
        return creatableItemsList.filter(item => {
            return userRole?.permissions?.includes(item.permission)
        })
    }

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

    const shouldShowQualityLink = () => (
        userRole && userRole.permissions.includes("qualite") 
    )

    const shouldShowManageLink = () => (
        userRole && userRole.permissions.includes("manage") 
    )

    const shouldShouldAvailabilityRatioModuleLink = () => (
        userRole && userRole.permissions.includes("rapports")
    )



    const manageQualityItem: NavMenuItemType = {
        icon: faChartSimple,
        label: "Qualité",
        href: "/quality",
        value: "quality",
        onClick: () => router.push("/quality")
    }

    const manageUsersItem: NavMenuItemType = {
        icon: faUsers,
        label: "Utilisateurs",
        href: "/user-management-dashboard",
        value: "users",
        onClick: () => router.push("/user-management-dashboard")
    }

    const availabilityRatioModuleItem: NavMenuItemType = {
        icon: faChartSimple,
        label: "Taux de disponibilité",
        href: "/availability-ratio-reports",
        value: "availability-ratio-reports",
        onClick: () => router.push("/availability-ratio-reports")
    }

    const navItems: NavMenuItemType[] = [
        {
            icon: faHome,
            label: "Accueil",
            href: "/",
            value: "home",
            onClick: () => router.push("/")
        },
        ...getAuthorizedCreatableItems().map(item => ({
            icon: item.icon,
            label: `Créer ${item.label}`,
            href: `/create/${item.value}`,
            value: item.value,
            onClick: () => router.push(`/create/${item.value}`)
        })),
        // only show the link to the quality module if the user's a manager
        ... shouldShowQualityLink() ? [manageQualityItem] : [],
        // only show the link to the user management page if the user's a manager
        ... shouldShowManageLink() ? [manageUsersItem] : [],
        // only show the link to the availability ratio module if the user's a manager
        ...shouldShouldAvailabilityRatioModuleLink() ? [availabilityRatioModuleItem] : [],
        {
            icon: faFolderOpen,
            label: "Mes fichiers",
            onClick: () => setShowFileExplorer(true),
            value: "files"
        },
        {
            icon: faFileLines,
            label: "Mes fiches",
            href: `/search?item=fiches&auteur_id=${user?.id}`,
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
                <NavSheet navItems={navItems} />
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