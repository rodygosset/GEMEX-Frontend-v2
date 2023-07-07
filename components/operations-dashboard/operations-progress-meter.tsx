import { APPROVED_STATUS_ID, DONE_STATUS_ID, FicheStatus, ficheStatusConf, FicheStatusId, INIT_STATUS_ID } from "@conf/api/data-types/fiche"
import { SearchResultsCount } from "@conf/api/search"
import { MySession } from "@conf/utility-types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import useAPIRequest from "@hook/useAPIRequest"
import styles from "@styles/components/operations-dashboard/operations-progress-meter.module.scss"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"

// this component displays information about ongoing operations 
// that the current user's been assigned


const OperationsProgressMeter = () => {

    // get user info

    const session = useSession().data as MySession | null

    const user = session?.user
    const userRole = session?.userRole

    // state
    // operation reports count per status type

    const [statusList, setStatusList] = useState<FicheStatus[]>([])

    const [totalFichesCount, setTotalFichesCount] = useState<number>(0)
    const [initStatusCount, setInitStatusCount] = useState<number>(0)
    const [doneStatusCount, setDoneStatusCount] = useState<number>(0)
    const [approvedStatusCount, setApprovedStatusCount] = useState<number>(0)

    // get operations report status data

    const makeAPIRequest = useAPIRequest()

    useEffect(() => {

        if(!user) return


        // GET data from the API

        // total number of operation reports (Fiches)

        makeAPIRequest<SearchResultsCount, void>(
            session,
            "post", 
            "fiches",
            "search/nb",
            {
                user_en_charge_id: user.id,
            },
            res => setTotalFichesCount(res.data.nb_results)
        )

        // GET the list of status types from the API
    

        makeAPIRequest<FicheStatus[], void>(
            session,
            "get",
            "fiches_status",
            undefined,
            undefined,
            res => setStatusList(res.data)
        )

        // get the number of operation reports (Fiches) for each status type

        makeAPIRequest<SearchResultsCount, void>(
            session,
            "post", 
            "fiches",
            "search/nb",
            {
                user_en_charge_id: user.id,
                status_id: INIT_STATUS_ID,
                is_active: true
            },
            res => setInitStatusCount(res.data.nb_results)
        )

        makeAPIRequest<SearchResultsCount, void>(
            session,
            "post", 
            "fiches",
            "search/nb",
            {
                user_en_charge_id: user.id,
                status_id: DONE_STATUS_ID,
                is_active: true
            },
            res => setDoneStatusCount(res.data.nb_results)
        )

        makeAPIRequest<SearchResultsCount, void>(
            session,
            "post", 
            "fiches",
            "search/nb",
            {
                user_en_charge_id: user.id,
                status_id: APPROVED_STATUS_ID,
                is_active: true
            },
            res => setApprovedStatusCount(res.data.nb_results)
        )


    }, [])


    // utils

    const getProgressBarWidth = () => {
        if(doneStatusCount == 0 || totalFichesCount == 0) {
            return "0%"
        }
        return `${doneStatusCount * 100 / (totalFichesCount - approvedStatusCount)}%`
    }

    const getOperationsCountForStatusType = (statusId: FicheStatusId) => {
        switch(statusId) {
            case INIT_STATUS_ID:
                return initStatusCount
            case DONE_STATUS_ID:
                return doneStatusCount
            case APPROVED_STATUS_ID:
                return approvedStatusCount
            default:
                return 0 
        }
    }

    // handlers

    // when the user clicks on a operations report status type 
    // we want to redirect them to the search page
    // to see the list of operations report that are of the chosen status type

    // so we start by building the corresponding URL

    const getStatusLink = (statusId: number) => {
        if(!user) return ''
        const query = new URLSearchParams({
            item: "fiches",
            user_en_charge_id: `${user.id}`,
            status_id: `${statusId}`,
            is_active: `${true}`
        })
        return `/search?${query}`
    }


    // render

    return (
        <>
        {
            user && userRole && statusList.length > 0 ?
            <section id={styles.operationsProgressMeter}>
                <div className={styles.sectionTitle}>
                    <h4>Opérations</h4>
                    <p><span>{ doneStatusCount }</span> / { totalFichesCount - approvedStatusCount }</p>
                </div>
                <div className={styles.progressBar}>
                    <div style={{ width: getProgressBarWidth() }}>p</div>
                </div>
                <div className={styles.links}>
                {
                    statusList.map((statusType, index) => {

                        // get status type style

                        const conf = ficheStatusConf.find(s => s.id == statusType.id)
                        if(!conf) return <></>

                        const { icon } = conf

                        // get operations report count for current status type

                        const count = getOperationsCountForStatusType(statusType.id)

                        // helper

                        const isPlural = () => {
                            const length = statusType.nom.length
                            return statusType.nom.charAt(length - 1) == "e" && (count > 1 || count == 0)
                        }

                        // render link

                        return (
                            <Link
                                key={`${statusType.nom}_${index}`}
                                className={styles[`status${statusType.id}`]}
                                href={getStatusLink(statusType.id)}>
                                <FontAwesomeIcon icon={icon}/>
                                { count } { statusType.nom.toLowerCase() }{ isPlural() ? 's' : '' }
                            </Link>
                        )
                    })
                }
                </div>
            </section>
            :
            <></>
        }
        </>
    )
}


export default OperationsProgressMeter