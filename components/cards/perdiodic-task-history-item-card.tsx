import Button from "@components/button";
import PeriodicTaskFulfillmentModal from "@components/modals/periodic-task-fulfillment-modal";
import { FicheSystematique } from "@conf/api/data-types/fiche";
import { getUserFullName, User } from "@conf/api/data-types/user";
import { faCalendarDays, faCheck, faHourglassHalf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAPIRequest from "@hook/useAPIRequest";
import styles from "@styles/components/cards/periodic-taks-history-item-card.module.scss"
import { capitalizeFirstLetter, dateOptions } from "@utils/general";
import { useEffect, useState } from "react";

interface Props {
    date: string;
    user_id: number;
    commentaire: string;
    isTodo?: boolean;
    isLatest?: boolean;
    task?: FicheSystematique; 
    latestDate?: Date;
    refresh?: () => void;
}

const PeriodicTaskHistoryItemCard = (
    {
        date,
        user_id,
        commentaire,
        isTodo,
        isLatest,
        task,
        latestDate,
        refresh
    }: Props
) => {


    // state

    const [user, setUser] = useState<User>()

    // get data about user

    const makeAPIRequest = useAPIRequest()

    useEffect(() => {

        makeAPIRequest<User, void>(
            "get",
            "users",
            `id/${user_id}`,
            undefined,
            res => setUser(res.data)
        )

    }, [user_id])

    // fulfillment form logic

    const [showForm, setShowForm] = useState(false)

    // utils

    const getClassNames = () => {
        let classNames = styles.card
        classNames += isTodo ? ' ' + styles.todo : ''
        return classNames
    }

    const getDateString = () => capitalizeFirstLetter(new Date(date).toLocaleDateString('fr-fr', dateOptions))

    // render

    return (
        <>
        {
            user ?
            <li className={getClassNames()}>
                <h4>
                    <FontAwesomeIcon icon={isTodo ? faHourglassHalf : faCalendarDays}/>
                    <span>{ getDateString() }</span>
                </h4>
                <p className={styles.userName}>{ getUserFullName(user) }</p>
                {
                    isTodo ?
                    <p className={styles.infoMessage}>À réaliser</p>
                    :
                    <></>
                }
                {
                    commentaire ?
                    <p>{commentaire}</p>
                    :
                    <></>
                }
                {
                    isTodo ?
                    <Button
                        icon={faCheck}
                        role="secondary"
                        onClick={() => setShowForm(true)}>
                            Marquer comme fait
                    </Button>
                    :
                    <></>
                }
                {
                    isLatest ?
                    <p className={styles.infoMessage}>Dernière réalisation de la tâche</p>
                    :
                    <></>
                }
                {
                    isTodo && task && refresh ?
                    <PeriodicTaskFulfillmentModal
                        isVisible={showForm}
                        closeModal={() => setShowForm(false)}
                        user={user}
                        task={task}
                        notBefore={latestDate}
                        onSubmit={refresh}
                    />
                    :
                    <></>
                }
            </li>
            :
            <></>
        }
        </>
    )
}


export default PeriodicTaskHistoryItemCard