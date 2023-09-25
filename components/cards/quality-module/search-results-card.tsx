import EvaluationsTable from "@components/quality-module/widgets/monthly-assessment-page/evaluations-table";
import { Cycle, Evaluation, MoisCycle } from "@conf/api/data-types/quality-module";
import { MySession } from "@conf/utility-types";
import useAPIRequest from "@hook/useAPIRequest";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";



interface Props {
    mois_cycle_id: number;
    evaluations: Evaluation[];
    onRefresh: () => void;
}

const SearchResultsCard = (
    {
        mois_cycle_id,
        evaluations,
        onRefresh
    }: Props
) => {

    // display info state

    const [monthAndYear, setMonthAndYear] = useState('')

    // get month and year from mois_cycle_id by calling the API

    const makeAPIRequest = useAPIRequest()
    const session = useSession().data as MySession | null

    const getMonthAndYear = async () => {
        if(!session) return ''

        makeAPIRequest<MoisCycle, void>(
            session,
            "get",
            "mois_cycle",
            `id/${mois_cycle_id}`,
            undefined,
            async res => {

                const cycleStartDate = await makeAPIRequest<Cycle, Date>(
                    session,
                    "get",
                    "cycles",
                    `id/${res.data.cycle_id}`,
                    undefined,
                    res => new Date(res.data.date_debut)
                )

                console.log("cycle start date: ", cycleStartDate)

                if(!cycleStartDate || cycleStartDate instanceof Error) return

                // get the month by adding moisCycle.mois (number of months) to the cycle start date
                const monthStartDate = new Date(cycleStartDate)
                monthStartDate.setMonth(monthStartDate.getMonth() + res.data.mois - 1)

                // capitalize the month the first letter of the month
                const month = monthStartDate.toLocaleString('fr-fr', { month: 'long' })

                // get the year of the cycle start date
                setMonthAndYear(`${month.charAt(0).toUpperCase() + month.slice(1)} ${monthStartDate.getFullYear()}`)
            }

        )
        
    }

    useEffect(() => {
        getMonthAndYear()
    }, [session, mois_cycle_id])

    useEffect(() => {

        console.log("month and year: ", monthAndYear)

    }, [monthAndYear])


    // render


    return monthAndYear ? (
        <div className="w-full flex flex-col gap-[32px] bg-white/10 shadow-2xl shadow-primary/20 p-[32px] rounded-[16px]">
            <h3 className="text-xl font-semibold text-primary">{monthAndYear}</h3>
            <EvaluationsTable
                evaluations={evaluations}
                description={`Résultats de la recherche pour le mois de ${monthAndYear}`}
                onRefresh={onRefresh}
            />
        </div>
    ) : <></>
}

export default SearchResultsCard