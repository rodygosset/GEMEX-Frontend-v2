import { apiURL } from "@conf/api/conf";
import { MySession } from "@conf/utility-types";
import { Context } from "@utils/context";
import axios from "axios";
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"
import { isAuthError } from "utils/req-utils";


interface Props {
    children: any;
}

const RouteGard = ({ children }: Props) => {
    const [authorized, setAuthorized] = useState(false)
    const router = useRouter()

    const { data, status } = useSession()

    const { navHistory } = useContext(Context)

    const session = data as MySession | null

    useEffect(() => {
        authCheck(router.asPath)
        
        const hideContent = () => setAuthorized(false)

        // when the route change beings, hide the page
        // also, clear the search params
        router.events.on('routeChangeStart', () => {
            hideContent()
        })

        // run authCheck when the route change is complete

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
        // in case the current route is public
        if(publicURLs.includes(path)) {
            setAuthorized(true)
            return
        }
        // in case we have to go to the login page
        // make sure we return to the latest route in the nav history
        const returnUrl = navHistory.length > 0 ? navHistory[navHistory.length - 1] : url
        // if the new route isn't public => requires authentication
        if(status == "unauthenticated") {
            setAuthorized(false)
            router.push({
                pathname: '/login',
                query: { returnUrl: returnUrl }
            })
        } else if(status == "authenticated") {
            // try to get data from an authenticated API route
            // using our session access token
            axios.get(`${apiURL}/hello/`, {
                headers: { Authorization: `bearer ${session?.access_token}` }
            })
            // if the request succeeds
            // show the current page
            .then(res => {
                if(res.status == 200) setAuthorized(true)
            })
            // if the api returns an auth error, redirect to login page
            .catch(error => {
                if(isAuthError(error)) {
                    // serialize the return url to use it in the query
                    const query = new URLSearchParams({
                        returnUrl: returnUrl
                    }).toString()
                    // sign out
                    // indicating to the login page which url to go back to 
                    signOut({ callbackUrl: `/login?${query}` })
                }
            })
        }
    }

    return (authorized && children)
}

export default RouteGard