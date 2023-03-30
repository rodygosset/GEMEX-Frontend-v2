import { getUserFullName, User, UserRole } from "@conf/api/data-types/user"
import useAPIRequest from "@hook/useAPIRequest";
import styles from "@styles/components/cards/user-management-dashboard/user-card.module.scss"
import { capitalizeFirstLetter } from "@utils/general";
import { MouseEvent, useEffect, useState } from "react"

interface Props {
    data: User;
    listView?: boolean;
    onClick?: () => void;
}

const UserCard = (
    {
        data,
        listView,
        onClick
    }: Props
) => {

    // state

    const [role, setRole] = useState<UserRole>()

    // get the role of the user

    const makeAPIRequest = useAPIRequest()

    useEffect(() => {

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

    // render
    
    return (
        <li 
            onClick={e => handleClick(e)}
            className={getClassNames()}>
            <div className={styles.textContent}>
                <h4>{ getUserFullName(data) }</h4>
                <p>{ capitalizeFirstLetter(role?.titre || "") }</p>
            </div>
        </li>
    )
}

export default UserCard