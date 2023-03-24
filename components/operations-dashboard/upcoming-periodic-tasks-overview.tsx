import { TO_BE_ASSIGNED_TAG } from "@conf/api/conf"
import { FicheSystematique, UpcomingTask } from "@conf/api/data-types/fiche"
import { MySession } from "@conf/utility-types"
import useAPIRequest from "@hook/useAPIRequest"
import styles from "@styles/components/operations-dashboard/list-component.module.scss"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import SectionHeader from "./ui-components/section-header"
import NoResult from "./ui-components/no-result"
import PeriodicTaskCard from "@components/cards/periodic-task-card"


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
                        date: new Date(fiche.date_prochaine),
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
    
    // render

    return (
        <>
        {
            user ?
            <section id="upcoming-periodic-tasks" className={styles.container}>
                <SectionHeader 
                    total={upcomingTasks.length} 
                    searchPageLink={getSearchPageLink()}>
                    Tâches à réaliser
                </SectionHeader>
                {
                    // list upcoming tasks
                    upcomingTasks.length > 0 ?
                    <ul>
                    {
                        upcomingTasks.map((task, index) => (
                            <PeriodicTaskCard 
                                key={`${task.label}_${index}`}
                                task={task}
                            />
                        ))
                    }
                    </ul>
                    :
                    // in case there's no upcoming task to list
                    <NoResult>Aucune tâche à venir</NoResult>
                }
            </section>
            :
            <></>
        }
        </>
    )
}


export default UpcomingPeriodicTasksOverview