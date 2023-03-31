import { getUserFullName, User, UserRole } from "@conf/api/data-types/user"
import useAPIRequest from "@hook/useAPIRequest";
import styles from "@styles/components/cards/user-management-dashboard/user-card.module.scss"
import { capitalizeFirstLetter } from "@utils/general";
import { MouseEvent, useEffect, useState } from "react"
import Image from "next/image";
import { UserManagementCardProps } from "@utils/types";


const UserCard = (
    {
        data,
        listView,
        onClick
    }: UserManagementCardProps<User>
) => {

    // state

    const [role, setRole] = useState<UserRole>()

    // get the role of the user

    const makeAPIRequest = useAPIRequest()

    useEffect(() => {

        if(!data.role_id) return

        makeAPIRequest<UserRole, void>(
            "get",
            "roles",
            `id/${data.role_id}`,
            undefined,
            res => setRole(res.data)
        )

    }, [data])

    // handlers

    const handleClick = (e: MouseEvent) => {
        e.stopPropagation()
        onClick && onClick()
    }

    // utils

    const getClassNames = () => {
        let classNames = styles.card
        classNames += listView ? ' ' + styles.listView : ''
        return classNames
    } 

    const getGroups = () => data.groups?.join(", ")

    // render
    
    return (
        <li 
            onClick={e => handleClick(e)}
            className={getClassNames()}>
            <div className={styles.mainContent}>
                <div className={styles.illustrationContainer}>
                    <Image 
                        className={styles.image}
                        quality={100}
                        src={'/images/male-user-illustration.svg'} 
                        alt={"Utilisateur"} 
                        priority
                        fill
                        style={{ 
                            objectFit: "contain", 
                            top: "auto"
                        }}
                    />
                    <Image 
                        className={styles.imageHover}
                        quality={100}
                        src={'/images/male-user-illustration-hover.svg'} 
                        alt={"Utilisateur"} 
                        priority
                        fill
                        style={{ 
                            objectFit: "contain", 
                            top: "auto"
                        }}
                    />
                </div>
                <div className={styles.textContent}>
                    <h4>{ getUserFullName(data) }</h4>
                    <p>{ capitalizeFirstLetter(role?.titre || "") }</p>
                </div>
            </div>
            <p className={styles.listContent}>
                <span className={styles.label}>Groupes</span>
                <span className={styles.value}>{ getGroups() }</span>
            </p>
        </li>
    )
}

export default UserCard