import Button, { buttonStatus } from "@components/button"
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons"
import { signOut } from "next-auth/react"
import { useState } from "react"


const LogOutButton = () => {
    
    const handleLogOut = () => signOut({ callbackUrl: '/login' })

    const [buttonStatus, setButtonStatus] = useState<buttonStatus>("discouraged")

    const handleMouseOver = () => setButtonStatus(undefined)

    const handleMouseLeave = () => setButtonStatus("discouraged")

    return (
        <Button 
            role="tertiary" 
            status={buttonStatus} 
            icon={faRightFromBracket} 
            onClick={handleLogOut}
            onMouseOver={handleMouseOver}
            onMouseLeave={handleMouseLeave}>
                Déconnexion
        </Button>
    )
}

export default LogOutButton