import { UserRole } from "@conf/api/data-types/user"
import { faUserGroup } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import useAPIRequest from "@hook/useAPIRequest"
import styles from "@styles/components/cards/user-management-dashboard/prop-card.module.scss"
import { UserManagementCardProps } from "@utils/types"
import { MouseEvent, useEffect, useState } from "react"


const RoleCard = (
    {
        data,
        listView,
        onClick
    }: UserManagementCardProps<UserRole>
) => {
    
    // state

    const [userCount, setUserCount] = useState<number>(0)

    // get the count of users having this role

    const makeAPIRequest = useAPIRequest()

    useEffect(() => {

        if(!data.id) return
            
        makeAPIRequest<{ nb_results: number }, void>(
            "post",
            "users",
            `search/nb`,
            {
                role_id: data.id
            },
            res => setUserCount(res.data.nb_results)
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
    
    // render
    
    return (
        <li 
            onClick={e => handleClick(e)}
            className={getClassNames()}>
            <FontAwesomeIcon icon={faUserGroup}/>
            <div className={styles.textContent}>
                <h4>{ data.titre }</h4>
                <p>{ userCount } utilisateur{ userCount != 1 ? 's' : '' }</p>
            </div>
        </li>
    )

}

export default RoleCard