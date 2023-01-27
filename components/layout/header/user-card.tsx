import { getUserFullName } from "@conf/api/data-types/user"
import { MySession } from "@conf/utility-types"
import { useSession } from "next-auth/react"
import Image from "next/image"

import styles from "@styles/layout/header/user-card.module.scss"
import { capitalizeFirstLetter } from "utils/general"

const UserCard = () => {

    const session = useSession().data as MySession

    const { userRole } = session

    return (
        <div className={styles.container}>
            <div className={styles.illustrationContainer}>
                <Image 
                    quality={100}
                    src={'/images/male-user-illustration.svg'} 
                    alt={"Utilisateur de GEMEX"} 
                    priority
                    fill
                    style={{ 
                        objectFit: "contain", 
                        top: "auto"
                    }}
                />
            </div>
            <div className={styles.userInfo}>
                <h5>{getUserFullName(session?.user)}</h5>
                <p>{userRole ? capitalizeFirstLetter(userRole.titre) : ""}</p>
            </div>

        </div>
    )
}

export default UserCard