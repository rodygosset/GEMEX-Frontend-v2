import Button from "@components/button";
import EvaluationFormModal from "@components/modals/quality-module/evaluation-form-modal";
import ChartWidget from "@components/quality-module/widgets/monthly-assessment-page/chart-widget";
import EvaluationsWidget from "@components/quality-module/widgets/monthly-assessment-page/evaluations-widget";
import ThematiquesWidget from "@components/quality-module/widgets/monthly-assessment-page/thematiques-widget";
import { Dialog, DialogTrigger } from "@components/radix/dialog";
import { Cycle, MoisCycle } from "@conf/api/data-types/quality-module";
import { MySession } from "@conf/utility-types";
import { faChevronLeft, faDownload, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAPIRequest from "@hook/useAPIRequest";
import SSRmakeAPIRequest from "@utils/ssr-make-api-request";
import { GetServerSideProps, NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";



interface Props {
    data: MoisCycle | null;
}

const MonthlyAssessmentPage: NextPage<Props> = (
    {
        data
    }: Props
) => {

    // state

    const [moisCycle, setMoisCycle] = useState<MoisCycle | null>(data)
    const [monthAndYear, setMonthAndYear] = useState<string>("")

    // utils

    const makeAPIRequest = useAPIRequest()
    const session = useSession().data as MySession | null

    const refreshMoisCycle = () => {
        if(!session || !moisCycle) return
    
        makeAPIRequest<MoisCycle, void>(
            session,
            'get',
            'mois_cycle',
            `id/${moisCycle.id}`,
            undefined,
            res => setMoisCycle(res.data)
        )
    }


    const getCycleStartDate = async () => {
        if(!session || !moisCycle) return

        const cycleStartDate = await makeAPIRequest<Cycle, Date>(
            session,
            'get',
            'cycles',
            `id/${moisCycle.cycle_id}`,
            undefined,
            res => new Date(res.data.date_debut)
        )

        return cycleStartDate
    }

    const getMonthAndYear = async (currentMoisCycle: MoisCycle) => {
        if(!session || !moisCycle) return ""
        
        const cycleStartDate = await getCycleStartDate()
        
        if(!cycleStartDate || cycleStartDate instanceof Error) return ""

        // get the month by adding moisCycle.mois (number of months) to the cycle start date
        const monthStartDate = new Date(cycleStartDate)
        monthStartDate.setMonth(monthStartDate.getMonth() + currentMoisCycle.mois - 1)

        // capitalize the month the first letter of the month
        const month = monthStartDate.toLocaleString('fr-fr', { month: 'long' })

        // get the year of the cycle start date
        return `${month.charAt(0).toUpperCase() + month.slice(1)} ${monthStartDate.getFullYear()}`
    }

    // effects

    useEffect(() => {
        if(!moisCycle  || !session) return
        getMonthAndYear(moisCycle).then(res => setMonthAndYear(res))
    }, [moisCycle, session])


    // render

    return moisCycle ? (
        <main className="flex flex-col px-[7%] gap-y-16 pt-6">
            <div className="w-full flex flex-row gap-16 flex-wrap">
                <Link
                    className="flex flex-row items-center justify-center w-[60px] h-[60px] rounded-full bg-primary/10
                        group hover:bg-primary hover:shadow-2xl hover:shadow-primary/40 transition duration-300 ease-in-out cursor-pointer
                    "
                    href="/quality">
                    <FontAwesomeIcon 
                        className="text-primary group-hover:text-white text-base transition duration-300 ease-in-out"
                        icon={faChevronLeft} 
                    />
                </Link>
                <div className="flex flex-col flex-1">
                    <h1 className="text-2xl text-primary font-semibold h-fit whitespace-nowrap">{ monthAndYear }</h1>
                    <p className="text-base text-primary uppercase text-opacity-40 tracking-widest whitespace-nowrap">évaluation mensuelle</p>
                </div>
            </div>
            <div className="w-full flex flex-row max-lg:flex-col gap-4">
                <ChartWidget moisCycle={moisCycle} />
                <ThematiquesWidget moisCycle={moisCycle} />
            </div>
            <div className="w-full flex flex-row gap-4 justify-between flex-wrap">
                <div className="flex flex-col">
                    <h3 className="text-xl font-semibold text-primary">Evaluations</h3>
                    <p className="text-base font-normal text-primary/60">Gestion des évaluation pour le mois de { monthAndYear }</p>
                </div>
                <div className="flex flex-row gap-4 flex-wrap items-center">
                    <Button
                        icon={faDownload}
                        role="secondary"
                        onClick={() => {}}>
                            Exporter les commentaires
                    </Button>
                    <EvaluationFormModal
                        mois_cycle_id={moisCycle.id}
                        onSubmit={() => {}}
                    />
                </div>
            </div>
            <EvaluationsWidget moisCycle={moisCycle} onRefresh={refreshMoisCycle} />
        </main>
    ) : <></>

}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {

    const session = (await getSession(context)) as MySession | null

    if(!session) return { props: { data: null } }

    // start with getting the item's DB id

    const id = context.query.id

    // make a request to the api to get the cycle from the database

    const data = await SSRmakeAPIRequest<MoisCycle, MoisCycle>({
        session,
        verb: 'get',
        itemType: 'mois_cycle',
        additionalPath: `id/${id}`,
        onSuccess: res => res.data
    })

    return {
        props: {
            data: data || null
        }
    }

}

export default MonthlyAssessmentPage