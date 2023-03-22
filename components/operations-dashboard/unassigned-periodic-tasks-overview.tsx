import PeriodicTaskCard from "@components/cards/periodic-task-card"
import { TO_BE_ASSIGNED_TAG } from "@conf/api/conf"
import { FicheSystematique, UpcomingTask } from "@conf/api/data-types/fiche"
import { MySession } from "@conf/utility-types"
import useAPIRequest from "@hook/useAPIRequest"
import styles from "@styles/components/operations-dashboard/list-component.module.scss"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import NoResult from "./ui-components/no-result"
import SectionHeader from "./ui-components/section-header"


interface Props {
    refreshTrigger: boolean;
    refresh: () => void;
}

const MAX_NB_ITEMS = 3

const UnassignedPeriodicTasksOverview = (
    {
        refreshTrigger,
        refresh
    }: Props
) => {


    // get user info

    const session = useSession().data as MySession | null

    const user = session?.user

    // state
    // => the data used to display the unassigned task cards

    const [unassignedTasks, setUnassignedTasks] = useState<UpcomingTask[]>([])

    // get the data from the API

    const makeAPIRequest = useAPIRequest()

    useEffect(() => {

        if(!user) return

        // only get fiche systematique objects (periodic task reports)
        // that have not been assigned yet (so they have the TO_BE_ASSIGNED tag)
        // & that have been created by a manager of the same group
        // as the current user

        makeAPIRequest<FicheSystematique[], void>(
            "post", 
            "fiches_systematiques",
            `search/?max=${MAX_NB_ITEMS}`,
            {
                tags: [TO_BE_ASSIGNED_TAG],
                groups: user.groups,
                is_active: true
            },
            res => {
                // convert those FicheSystematique objects
                // to lighter objects that contain the data 
                // needed by the card components
                const taskList: UpcomingTask[] = res.data.map(fiche => ({
                        label: fiche.nom,
                        date: new Date(fiche.date_creation),
                        fiche_id: fiche.id
                    }))
                setUnassignedTasks(taskList)
            },
        )

    }, [refreshTrigger])

    // utils

    // build a link to the search page
    // that will allow the user to get the full list of unassigned tasks

    const getSearchPageLink = () => {
        if(!user) return ''
        const query = new URLSearchParams({
            item: "fiches_systematiques",
            auteur_id: `${user.id}`,
            tags: `${TO_BE_ASSIGNED_TAG}`,
            is_active: "true"
        })
        for(const group of user.groups) {
            query.append("groups", group)
        }
        return `/search?${query}`
    }

    // render

    return (
        <>
        {
            user ?
            <section id="unassigned-periodic-tasks" className={styles.container}>
                <SectionHeader
                    total={unassignedTasks.length}
                    searchPageLink={getSearchPageLink()}>
                    Tâches en attente d'attribution
                </SectionHeader>
                {
                    // list unassigned tasks
                    unassignedTasks.length > 0 ?
                    <ul>
                    {
                        unassignedTasks.map((task, index) => (
                            <PeriodicTaskCard 
                                key={`${task.label}_${index}`}
                                task={task}
                                onTaskAssign={refresh}
                                showAssignButton
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

export default UnassignedPeriodicTasksOverview