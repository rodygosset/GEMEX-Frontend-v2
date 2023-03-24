import Button from "@components/button";
import TextInput from "@components/form-elements/text-input";
import DeleteDialog from "@components/modals/delete-dialog";
import PeriodicTaskFulfillmentModal from "@components/modals/periodic-task-fulfillment-modal";
import { FicheSystematique } from "@conf/api/data-types/fiche";
import { getUserFullName, User } from "@conf/api/data-types/user";
import { faCalendarDays, faCheck, faFloppyDisk, faHourglassHalf, faPenToSquare, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAPIRequest from "@hook/useAPIRequest";
import styles from "@styles/components/cards/periodic-taks-history-item-card.module.scss"
import { capitalizeFirstLetter, dateOptions } from "@utils/general";
import { useEffect, useState } from "react";

interface Props {
    currentUserIsAuthor?: boolean;
    id?: number;
    date: string;
    user_id: number;
    commentaire: string;
    isTodo?: boolean;
    isLatest?: boolean;
    task?: FicheSystematique; 
    latestDate?: Date;
    refresh: () => void;
}

const PeriodicTaskHistoryItemCard = (
    {
        id,
        currentUserIsAuthor,
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

    // handlers

    // => only ever used when the edit button is shown
    // => which is only ever when the current user is the author 

    const [isEditMode, setIsEditMode] = useState(false)

    const [updatedComment, setUpdatedComment] = useState(commentaire)

    const handleEditClick = () => setIsEditMode(true)

    // when the user saves the changes

    const handleSaveClick = () => {
        // make a PUT request to our API
        makeAPIRequest<{ commentaire: string }, void>(
            "put",
            "historiques_fiches_systematiques",
            `${id}`,
            { commentaire: updatedComment },
            () => {
                // turn off edit mode && refresh the content
                setIsEditMode(false)
                refresh()
            }
        )

    }

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
                    commentaire && !isEditMode ?
                    <p>{commentaire}</p>
                    :
                    <></>
                }
                {
                    isEditMode ?
                    <form>
                        <TextInput
                            name="comment"
                            isTextArea
                            fullWidth
                            currentValue={updatedComment}
                            onChange={setUpdatedComment}
                        />
                    </form>
                    :
                    <></>
                }
                {
                    isTodo ?
                    <Button
                        icon={faCheck}
                        role="secondary"
                        fullWidth
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
                    currentUserIsAuthor && id && !isEditMode ?
                    <Button
                        icon={faPenToSquare}
                        role="secondary" 
                        fullWidth
                        onClick={handleEditClick}>
                        Modifier
                    </Button>
                    :
                    <></>
                }
                {
                    currentUserIsAuthor && id && isEditMode ?
                    <Button
                        icon={faFloppyDisk}
                        role="secondary" 
                        fullWidth
                        onClick={handleSaveClick}>
                        Sauvegarder
                    </Button>
                    :
                    <></>
                }
                {
                    isTodo && task ?
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