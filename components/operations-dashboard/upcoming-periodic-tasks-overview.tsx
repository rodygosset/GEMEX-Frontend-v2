import { TO_BE_ASSIGNED_TAG } from "@conf/api/conf"
import { FicheSystematique, UpcomingTask } from "@conf/api/data-types/fiche"
import { MySession } from "@conf/utility-types"
import { faCalendar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import useAPIRequest from "@hook/useAPIRequest"
import styles from "@styles/components/operations-dashboard/upcoming-periodic-tasks-overview.module.scss"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"


interface Props {
    refreshTrigger: boolean
}

const MAX_NB_ITEMS = 5


const UpcomingPeriodicTasksOverview = (
    {
        refreshTrigger
    }: Props
) => {

    // get user info

    const session = useSession().data as MySession | null

    const user = session?.user

    // state
    // => the data used to display the upcoming task cards

    const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([])

    // get the needed data

    const makeAPIRequest = useAPIRequest()

    useEffect(() => {

        if(!user) return 

        // only get fiche systematique objects (periodic task reports)
        // that have been assigned to the current user
        // and that haven't been archived

        makeAPIRequest<FicheSystematique[], void>(
            "post", 
            "fiches_systematiques",
            `search/?max=${MAX_NB_ITEMS}`,
            {
                user_en_charge_id: user.id,
                is_active: true
            },
            res => {
                // convert those FicheSystematique objects
                // to lighter objects that contain the data 
                // needed by the card components
                const taskList: UpcomingTask[] = res.data.filter(fiche => !fiche.tags.includes(TO_BE_ASSIGNED_TAG))
                    .map(fiche => ({
                        label: fiche.nom,
                        date: new Date(fiche.date_creation),
                        fiche_id: fiche.id
                    }))
                setUpcomingTasks(taskList)
            },
        )

    }, [refreshTrigger])


    // utils

    // build a link to the search page
    // that will allow the user to get the full list of upc

    const getSearchPageLink = () => {
        if(!user) return ''
        const query = new URLSearchParams({
            item: "fiches_systematiques",
            auteur_id: `${user.id}`,
            is_active: "true"
        })
        return `/search?${query}`
    }

    const getViewLink = (task: UpcomingTask) => `/view/fiches/systematiques/${task.fiche_id}` 

    // render

    return (
        <>
        {
            user ?
            <section id={styles.upcomingPeriodicTasks}>
                <div className={styles.sectionTitle}>
                    <h4>Tâches à réaliser</h4>
                    <p>
                        <span>{ upcomingTasks.length } au total</span>
                        <Link href={getSearchPageLink()}>
                            Voir plus
                        </Link>
                    </p>
                </div>
                <ul>
                {
                    upcomingTasks.length > 0 ?
                    upcomingTasks.map((task, index) => (
                        <li key={`${task.label}_${index}`}>
                            <Link href={getViewLink(task)}>
                                <span className={styles.label}>{task.label}</span>
                                <span className={styles.date}>
                                    <FontAwesomeIcon icon={faCalendar}/>
                                    { task.date.toLocaleDateString("fr-fr") }
                                </span>
                            </Link>
                        </li>
                    ))
                    :
                    <div className={styles.noResult}>
                        <div className={styles.illustrationContainer}>
                            <Image 
                                quality={100}
                                src={'/images/void.svg'} 
                                alt={"Aucun fichier"} 
                                priority
                                fill
                                style={{ 
                                    objectFit: "contain", 
                                    top: "auto"
                                }}
                            />
                        </div>
                        <p>Aucune tâche à venir</p>
                    </div>
                }
                </ul>
            </section>
            :
            <></>
        }
        </>
    )
}


export default UpcomingPeriodicTasksOverview