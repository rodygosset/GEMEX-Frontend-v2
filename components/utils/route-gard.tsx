import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"


interface Props {
    children: any
}

const RouteGard = ({ children }: Props) => {
    const [authorized, setAuthorized] = useState(false)
    const router = useRouter()

    const { status } = useSession()

    useEffect(() => {
        authCheck(router.asPath)
        
        const hideContent = () => setAuthorized(false)
        
        // when the route change beings, hide the page
        router.events.on('routeChangeStart', hideContent)

        // run authCheck again when the route change is complete

        router.events.on('routeChangeComplete', authCheck)

        // cleanup
        return () => {
            router.events.off('routeChangeStart', hideContent)
            router.events.off('routeChangeComplete', authCheck)
        }
    }, [status])

    const authCheck = (url: string) => {
        const publicURLs = ['/login']
        const path = url.split('?')[0]
        if(status == "unauthenticated" && !publicURLs.includes(path)) {
            setAuthorized(false)
            console.log("current path", path)
            router.push({
                pathname: '/login',
                query: { returnUrl: url }
            })
        } else { setAuthorized(true) }
    }

    return (authorized && children)
}

export default RouteGard