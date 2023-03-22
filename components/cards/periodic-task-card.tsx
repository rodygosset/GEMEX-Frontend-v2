import styles from "@styles/components/cards/periodic-task-card.module.scss"
import { FicheSystematique, UpcomingTask } from "@conf/api/data-types/fiche"
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import Button from "@components/button";
import useAPIRequest from "@hook/useAPIRequest";
import { useSession } from "next-auth/react";
import { MySession } from "@conf/utility-types";

interface Props {
    task: UpcomingTask;
    showAssignButton?: boolean;
    onTaskAssign?: () => void;
}

// this component is used by the operation dashboard components
// to show info about periodic task reports (Fiches Systematiques)

const PeriodicTaskCard = (
    {
        task,
        showAssignButton,
        onTaskAssign
    }: Props
) => {

    // get user info

    const session = useSession().data as MySession | null

    const user = session?.user

    // utils

    const getViewLink = () => `/view/fiches/systematiques/${task.fiche_id}` 

    // handlers

    const makeAPIRequest = useAPIRequest()

    const handleAssignToMeClick = (e: MouseEvent) => {
        e.preventDefault()

        // assign the task to the current user
        // => make a PUT request

        if(!user) return

        makeAPIRequest<FicheSystematique[], void>(
            "put", 
            "fiches_systematiques",
            task.label,
            {
                user_en_charge_id: user.id
            },
            () => { 
                if(!onTaskAssign) return
                onTaskAssign()
            }
        )
    }

    // render

    return (
        <li className={styles.card}>
            <Link href={getViewLink()}>
                <span className={styles.label}>{task.label}</span>
                <span className={styles.date}>
                    <FontAwesomeIcon icon={faCalendar}/>
                    { task.date.toLocaleDateString("fr-fr") }
                </span>
                {
                    showAssignButton ?
                    <Button
                        status="success"
                        role="secondary"
                        onClick={handleAssignToMeClick}>
                        Me l'attribuer
                    </Button>
                    :
                    <></>
                }
            </Link>
        </li>
    )
}

export default PeriodicTaskCard