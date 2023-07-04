import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import LoadingIndicator from "./loading-indicator"

import styles from '@styles/components/utils/route-change-indicator.module.scss'

interface Props {
    children: any;
}

const RouteChangeIndicator = ({ children }: Props) => {


    const router = useRouter()
    const [isRouteChanging, setIsRouteChanging] = useState(false)

    // when the route changes, set isRouteChanging to true
    // & when the route changes complete, set isRouteChanging to false

    useEffect(() => {
        const handleStart = () => setIsRouteChanging(true)
        const handleComplete = () => setIsRouteChanging(false)

        router.events.on('routeChangeStart', handleStart)
        router.events.on('routeChangeComplete', handleComplete)
        router.events.on('routeChangeError', handleComplete)

        return () => {
            router.events.off('routeChangeStart', handleStart)
            router.events.off('routeChangeComplete', handleComplete)
            router.events.off('routeChangeError', handleComplete)
        }
    }, [router])

    // display the loading indicator on route change

    return isRouteChanging ? (
        <main id={styles.container}>
            <LoadingIndicator />
        </main>
    ) : children

}

export default RouteChangeIndicator