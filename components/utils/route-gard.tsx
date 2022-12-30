import { apiURL } from "@conf/api/conf";
import { MySession } from "@conf/utility-types";
import axios from "axios";
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { isAuthError } from "utils/req-utils";


interface Props {
    children: any;
}

const RouteGard = ({ children }: Props) => {
    const [authorized, setAuthorized] = useState(false)
    const router = useRouter()

    const { data, status } = useSession()

    const session = data as MySession

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
        const publicURLs = [
            '/login',
            '/404'
        ]
        const path = url.split('?')[0]
        if(!publicURLs.includes(path)) {
            if(status == "unauthenticated") {
                setAuthorized(false)
                router.push({
                    pathname: '/login',
                    query: { returnUrl: url }
                })
            } else if(status == "authenticated") {
                // try to get user data using the access token in the session
                // if the api returns with an auth error, redirect to login page
                axios.get(`${apiURL}/hello/`, {
                    headers: { Authorization: `bearer ${session.access_token}` }
                }).then(res => {
                    if(res.status == 200) setAuthorized(true)
                })
                .catch(error => {
                    if(isAuthError(error)) {
                        signOut({ callbackUrl: '/login' })
                    }
                })
            }
        } else {
            // in case the url is public
            setAuthorized(true)
        }
    }

    return (authorized && children)
}

export default RouteGard