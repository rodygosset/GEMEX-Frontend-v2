import Button from "@components/button";
import { FicheSystematique, HistoriqueFicheSystematique } from "@conf/api/data-types/fiche";
import { searchItemIcons } from "@conf/api/search";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faBox, faCircle, faClockRotateLeft, faMonument } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAPIRequest from "@hook/useAPIRequest";
import styles from "@styles/components/modals/periodic-task-history-modal.module.scss"
import { itemTypetoAttributeName } from "@utils/general";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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

    // state
    
    // info to display

    const [targetItemName, setTargetItemName] = useState("")
    const [targetItemIcon, setTargetItemIcon] = useState<IconProp>(faBox)

    // previous task fulfillments

    const [taskHistory, setTaskHistory] = useState<HistoriqueFicheSystematique[]>([])


    // get the data we need from the API
    // => text info & task history items

    const makeAPIRequest = useAPIRequest()

    useEffect(() => {


        console.log(task)

        // determine the item type and the id of the task's target item

        let targetItemId = 0
        let targetItemType = ""

        if(task.ilot_id != null) {
            targetItemType = "ilots"
            targetItemId = task.ilot_id
        }
        else if(task.exposition_id != null) {
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

        // todo => get the task history items from the API

    }, [])

    // utils

    const router = useRouter()

    const refresh = () => router.push(router.asPath)


    // render

    return (
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
                <Button
                    role="secondary"
                    onClick={closeModal}>
                    Fermer
                </Button>
            </section>
        </ModalContainer>
    )
}

export default PeriodicTaskHistoryModal