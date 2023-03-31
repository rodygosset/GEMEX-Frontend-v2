
import { UserGroup } from "@conf/api/data-types/user"
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/components/cards/user-management-dashboard/prop-card.module.scss"
import { UserManagementCardProps } from "@utils/types"
import { MouseEvent } from "react"


const UserGroupCard = (
    {
        data,
        listView,
        onClick
    }: UserManagementCardProps<UserGroup>
) => {
    

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
            <FontAwesomeIcon icon={faShieldHalved}/>
            <div className={styles.textContent}>
                <h4>{ data.nom }</h4>
                <p>{ data.users?.length } utilisateurs</p>
            </div>
        </li>
    )

}

export default UserGroupCard