import styles from "@styles/components/go-back-button.module.scss"
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useContext } from "react"
import { Context } from "@utils/context"
import Link from "next/link"

import { MouseEvent } from "react"
import { useRouter } from "next/router"


// this component simply handles going to the previous page
// and is styled according to the GEMEX design system

interface Props {
    onClick?: () => void
}

const GoBackButton = (
    {
        onClick
    }: Props
) => {


    const { navHistory, setNavHistory } = useContext(Context)

    // utils

    const getHref = () => {
        // if navHistory is empty
        // go back to the home page
        if(navHistory.length < 2) return '/'
        // otherwise, go back to the last page
        return navHistory[navHistory.length - 2]
    }

    // override default behavior

    const router = useRouter()

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation()
        event.preventDefault()
        // clear the nav history of the current route
        // & of the one we're going back to
        setNavHistory(navHistory.slice(0, navHistory.length - 2))
        if(onClick) onClick
        // then navigate to the previous URL
        router.push(getHref())
    }

    // render

    return (
        <Link 
            href={getHref()}
            className={styles.goBackButton}
            onClick={e => handleClick(e)}>
            <FontAwesomeIcon icon={faChevronLeft}/>
        </Link>
    )
}

export default GoBackButton