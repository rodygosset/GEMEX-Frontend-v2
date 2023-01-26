import styles from "@styles/components/go-back-button.module.scss"
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useContext, useEffect } from "react"
import { Context } from "@utils/context"
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


    const { navHistory } = useContext(Context)

    // handle click logic

    const router = useRouter()

    const handleClick = () => {
        if(onClick) onClick
        // if navHistory isn't empty
        // go back to the last page
        const lastRoute = navHistory.pop()
        router.push(lastRoute ? lastRoute : '/')
    }

    // render

    return (
        <button 
            className={styles.goBackButton}
            onClick={handleClick}>
            <FontAwesomeIcon icon={faChevronLeft}/>
        </button>
    )
}

export default GoBackButton