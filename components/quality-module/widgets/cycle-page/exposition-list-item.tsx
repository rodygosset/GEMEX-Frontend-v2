import Button from "@components/button";
import { Exposition } from "@conf/api/data-types/exposition";
import { Cycle, Evaluation, MoisCycle } from "@conf/api/data-types/quality-module";
import { MySession } from "@conf/utility-types";
import { faCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAPIRequest from "@hook/useAPIRequest";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";


interface CycleExposition {
    nom: string;
    note?: number;
    latestEvaluation?: Evaluation;
}

interface Props {
    cycle: Cycle;
    expositionId: number;
    onRefresh: () => void;
}

const ExpositionListItem = (
    {
        cycle,
        expositionId,
        onRefresh
    }: Props
) => {


    // state
    
    const [cycleExposition, setCycleExposition] = useState<CycleExposition | null>(null)

    // needed hooks to get what we need to make requests to the API

    const makeAPIRequest = useAPIRequest()
    const session = useSession().data as MySession | null

    useEffect(() => {
        getCycleExposition()
    }, [cycle, expositionId, session])



    // get the data we need to display

    
    const getCycleExposition = async () => {
        if(!session) return

        let data: CycleExposition = { nom: "" }

        // make a request to the API to get the exposition's name

        const nomExposition = await makeAPIRequest<Exposition, string>(
            session,
            "get",
            "expositions",
            `id/${expositionId}`,
            null,
            res => res.data.nom
        )

        if(nomExposition && !(nomExposition instanceof Error)) {
            data.nom = nomExposition
        }

        // get all the evaluations for this exposition

        const latestEvaluation = await makeAPIRequest<Evaluation[], Evaluation | undefined>(
            session,
            "post",
            "evaluations",
            "search",
            {
                expositions: [expositionId]
            },
            // get the latest evaluation from the list
            res => res.data.length > 0 ? res.data.sort((a, b) => new Date(b.date_rendu).getTime() - new Date(a.date_rendu).getTime())[0] : undefined
        )

        if(latestEvaluation && !(latestEvaluation instanceof Error)) {
            data.latestEvaluation = latestEvaluation
        
            // get the note for this exposition

            const note = await makeAPIRequest<MoisCycle, number | undefined>(
                session,
                "get",
                "mois_cycle",
                `id/${latestEvaluation.mois_cycle_id}`,
                undefined,
                res => res.data.expositions.find(exposition => exposition.exposition_id === expositionId)?.note
            )

            if(note && !(note instanceof Error)) {
                data.note = note
            }

            
        }

        setCycleExposition(data)
    }


    // handlers

    // update the cycle to remove the exposition from the list

    const handleDelete = async () => {
        if(!session) return

        await makeAPIRequest(
            session,
            "put",
            "cycles",
            `id/${cycle.id}`,
            {
                expositions: cycle.expositions.filter(exposition => exposition.exposition_id !== expositionId).map(exposition => exposition.exposition_id)
            }
        )

        // refresh the page
        onRefresh()
    }
    

    // utils

    const getMonthAndYear = (date: Date) => {
        // capitalize the month the first letter of the month
        const month = date.toLocaleString('fr-fr', { month: 'long' })

        // get the year of the cycle start date
        return `${month.charAt(0).toUpperCase() + month.slice(1)} ${date.getFullYear()}`
    }


    // render

    return cycleExposition ? (
        <li
            className="flex-1 rounded-[8px] hover:bg-primary/5 transition duration-300 ease-in-out flex flex-row items-center p-[16px] gap-4 whitespace-nowrap"
            key={`${cycle.id}-${expositionId}`}>
                <div className="flex flex-col w-full">
                    <span className="w-full whitespace-normal text-base font-semibold text-primary flex flex-row gap-2 items-center">
                        { cycleExposition.nom }
                        {
                            cycleExposition.note ?
                            <>
                                <FontAwesomeIcon icon={faCircle} className="text-primary/40 text-[0.4rem] mx-2" />
                                <b className={`text-base font-bold ${cycleExposition.note >= 16 ? "text-success" : cycleExposition.note >= 15 ? "text-warning" : "text-error"}`}>
                                    { cycleExposition.note }
                                </b>
                            </>
                            : <></>
                        }
                    </span>
                    <span className="flex flex-row gap-2 items-center">
                    {
                        cycleExposition.latestEvaluation ?
                        // if the evaluation has been done
                        cycleExposition.latestEvaluation?.date_rendu_reelle ?
                            <span className="text-sm font-normal text-primary/60">{ getMonthAndYear(new Date(cycleExposition.latestEvaluation.date_rendu_reelle)) }</span>
                            :
                            // if it's planned
                            <span className="text-sm font-bold text-primary/60">Prévu pour { getMonthAndYear(new Date(cycleExposition.latestEvaluation.date_rendu)) }</span>
                        : 
                        <>
                            <span className="text-sm font-normal text-primary/60">A faire</span>
                            {/* <FontAwesomeIcon icon={faCircle} className="text-primary/40 text-[0.4rem] mx-2" />
                            <button className="text-sm font-normal text-warning px-[8px] py-[4px] border border-warning/20 rounded-lg bg-warning/10
                                            hover:bg-warning hover:text-white cursor-pointer transition duration-300 ease-in-out">
                                Planifier
                            </button> */}
                        </>
                    }
                    </span>
                </div>
                {
                    !cycleExposition.latestEvaluation ?
                    <Button
                        icon={faTrash}
                        status="danger"
                        role="tertiary"
                        hasBorders
                        onClick={handleDelete}>

                    </Button>
                    : <></>
                }
        </li>
    ) : <></>

}

export default ExpositionListItem