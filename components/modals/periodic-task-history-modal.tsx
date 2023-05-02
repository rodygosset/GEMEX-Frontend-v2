import Button from "@components/button";
import PeriodicTaskHistoryItemCard from "@components/cards/perdiodic-task-history-item-card";
import NoResult from "@components/operations-dashboard/ui-components/no-result";
import { TO_BE_ASSIGNED_TAG } from "@conf/api/conf";
import { FicheSystematique, HistoriqueFicheSystematique } from "@conf/api/data-types/fiche";
import { searchItemIcons } from "@conf/api/search";
import { MySession } from "@conf/utility-types";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faBox, faCircle, faClockRotateLeft, faMonument } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAPIRequest from "@hook/useAPIRequest";
import styles from "@styles/components/modals/periodic-task-history-modal.module.scss"
import { dateOptions, itemTypetoAttributeName, toISO } from "@utils/general";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import ModalContainer from "./modal-container";


interface Props {
    isVisible: boolean;
    closeModal: () => void;
    task: FicheSystematique;
}

// this component displays a timeline 
// of the fulfillment of a periodic task

const PeriodicTaskHistoryModal = (
    {
        isVisible,
        closeModal,
        task
    }: Props
) => {

    // get user info

    const session = useSession().data as MySession | null

    const user = session?.user

    // state
    
    // info to display

    const [targetItemName, setTargetItemName] = useState("")
    const [targetItemIcon, setTargetItemIcon] = useState<IconProp>(faBox)

    // previous task fulfillments

    const [taskHistory, setTaskHistory] = useState<HistoriqueFicheSystematique[]>([])

    // refresh 

    const [refreshTrigger, setRefreshTrigger] = useState(false)

    const refresh = () => setRefreshTrigger(!refreshTrigger)


    // get the data we need from the API
    // => text info & task history items

    const makeAPIRequest = useAPIRequest()

    // sort by date

    const sortDate = (a: string, b: string) => Date.parse(a) - Date.parse(b)

    useEffect(() => {

        // determine the item type and the id of the task's target item

        let targetItemId = 0
        let targetItemType = ""

        if(task.exposition_id != null) {
            targetItemType = "expositions"
            targetItemId = task.exposition_id
        }
        else if(task.element_id != null) {
            targetItemType = "elements"
            targetItemId = task.element_id
        }

        // @ts-ignore
        targetItemId = task[itemTypetoAttributeName(targetItemType)]

        if(!targetItemType || !targetItemId || targetItemId < 1) return

        // update target item icon

        setTargetItemIcon(searchItemIcons[targetItemType])

        // get its name

        makeAPIRequest<any, void>(
            "get",
            targetItemType,
            `id/${targetItemId}`,
            undefined,
            res => setTargetItemName(res.data.nom)
        )

        // get the task history items from the API

        makeAPIRequest<HistoriqueFicheSystematique[], void>(
            "post",
            "historiques_fiches_systematiques",
            "search/",
            {
                fiche_id: task.id
            },
            res => setTaskHistory(res.data.sort((a, b) => sortDate(a.date, b.date)).reverse())
        )

    }, [refreshTrigger])

    // utils

    const currentUserIsInCharge = () => user && task.user_en_charge_id == user.id


    const getLatestTaskFulfillmentDate = () => {
        if(taskHistory.length < 1) return undefined
        const latestTaskFulfillment = taskHistory.sort((a, b) => sortDate(a.date, b.date)).reverse()[0]
        const latestDate = new Date(latestTaskFulfillment.date)
        latestDate.setDate(latestDate.getDate() + 1)
        return latestDate
    }

    const getDayBefore = (date: Date) => {
        const dayBefore = new Date(date)
        dayBefore.setDate(dayBefore.getDate() - 1)
        return dayBefore
    } 


    // helper used to make sure there isn't already a task fulfillment item 
    // for today's date, in which case we don't allow the user
    // to see the task fulfillment form

    const latestTaskFulfillmentIsTomorrow = () => {
        const latestDate = getLatestTaskFulfillmentDate()
        if(!latestDate) return false

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return (
            latestDate.getDate() == tomorrow.getDate() &&
            latestDate.getMonth() == tomorrow.getMonth() &&
            latestDate.getFullYear() == tomorrow.getFullYear() 
        )
    }

    // helper to check whether a task fulfillment item is the latest one

    const isLatest = (date: Date) =>{
        const latestDate = getLatestTaskFulfillmentDate()
        if(!latestDate) return false
        return toISO(date) == toISO(getDayBefore(latestDate))
    } 

    // determine whether the form should be visible

    const shouldShowForm = () => currentUserIsInCharge() as boolean && !latestTaskFulfillmentIsTomorrow() && !task.tags.includes(TO_BE_ASSIGNED_TAG)

    // keep the timeline full width

    const [timelineWidh, setTimelineWidh] = useState(0)

    useEffect(() => {

        // compute the size of the timeline

        let width = 15 * 2 + (taskHistory.length) * 275 + (taskHistory.length - 1) * 30
        width += shouldShowForm() ? 275 + 30 : 0
        setTimelineWidh(width)
        
    }, [taskHistory])

    // render

    return (
        <>
        {
            user ?
            <ModalContainer isVisible={isVisible}>
                <section className={styles.modal}>
                    <h3>{ task.nom }</h3>
                    <div className={styles.headerCaption}>
                        <p>  
                            <FontAwesomeIcon icon={faClockRotateLeft}/>
                            <span>Historique</span>
                        </p>
                        <FontAwesomeIcon icon={faCircle} className={styles.dot}/>
                        <p>
                            <FontAwesomeIcon icon={targetItemIcon}/>
                            <span>{ targetItemName }</span>
                        </p>
                    </div>
                    {
                        // only show the timeline
                        // if there are history items to show
                        // or if we can show the task fulfillment form   
                        currentUserIsInCharge() || taskHistory.length > 0 ?
                        <ul className="scroll">
                            <div className={styles.timeline} style={{ width: `${timelineWidh}px` }}>timeline</div>
                        {
                            // only allow the user who was assigned the current task
                            // to see the task fulfillment form 
                            // & only if the latest fulfillment isn't today
                            shouldShowForm() ?
                            <PeriodicTaskHistoryItemCard
                                isTodo
                                date={toISO(new Date(task.date_prochaine))}
                                user_id={user.id}
                                commentaire=""
                                task={task}
                                latestDate={getLatestTaskFulfillmentDate()}
                                refresh={refresh}
                            />
                            :
                            <></>
                        }
                        {
                            taskHistory.map((taskHistoryItem, index) => (
                                <PeriodicTaskHistoryItemCard 
                                    key={`${taskHistoryItem.id}_${index}`}
                                    id={taskHistoryItem.id}
                                    currentUserIsAuthor={taskHistoryItem.user_id == user.id}
                                    date={taskHistoryItem.date}
                                    user_id={taskHistoryItem.user_id}
                                    commentaire={taskHistoryItem.commentaire} 
                                    isLatest={isLatest(new Date(taskHistoryItem.date))}
                                    refresh={refresh}
                                />
                            ))
                        }
                        </ul>
                        :
                        // in case there's nothing to show
                        <NoResult>Aucun historique pour cette fiche</NoResult>
                    }
                    <Button
                        role="secondary"
                        onClick={closeModal}>
                        Fermer
                    </Button>
                </section>
            </ModalContainer>
            :
            <></>
        }
        </>
    )
}

export default PeriodicTaskHistoryModal