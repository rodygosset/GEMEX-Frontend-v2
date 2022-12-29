import { signOut } from "next-auth/react"
import { useRouter } from "next/router"


const useLogOut = () => {

    // log out

    signOut()

    // go to the login page, 
    // & ensure the user is redirected to the same page
    // after a successful login

    const router = useRouter()

    router.push({
        pathname: '/login',
        query: { returnUrl: router.asPath }
    })

}

export default useLogOut