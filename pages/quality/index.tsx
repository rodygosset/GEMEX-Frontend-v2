
import SettingsWidget from "@components/quality-module/settings-widget";
import CurrentCycleWidget from "@components/quality-module/widgets/current-cycle-widget";
import CurrentMonthlyAssessmentWidget from "@components/quality-module/widgets/current-monthly-assessment-widget";
import CyclesWidget from "@components/quality-module/widgets/cycles-widget";
import { Cycle } from "@conf/api/data-types/quality-module";
import { MySession } from "@conf/utility-types";
import { faArrowRight, faChartPie } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SSRmakeAPIRequest from "@utils/ssr-make-api-request";
import { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

interface Props {
    cycles: Cycle[];  
    currentCycleId: number | null; 
}

const Home: NextPage<Props> = (
    {
        cycles,
        currentCycleId
    }: Props
) => {

    const router = useRouter()


    // utils

    const getLatestMonth = () => {
        if(cycles.length == 0 || !currentCycleId) return
        const currentCycle = cycles.find(cycle => cycle.id === currentCycleId)
        if(!currentCycle) return
        return currentCycle.mois_cycle.reduce((acc, curr) => {
            if(curr.mois > acc.mois) return curr
            return acc
        })
    }

    const getCycleStartDate = () => {
        if(cycles.length == 0 || !currentCycleId) return
        const currentCycle = cycles.find(cycle => cycle.id === currentCycleId)
        if(!currentCycle) return
        return new Date(currentCycle.date_debut)
    }

    // render

    return (
        <main className="flex flex-col px-[7%] gap-y-16 pt-6">
            <div className="flex flex-row flex-wrap items-center gap-8">
                <div className="flex flex-row items-center gap-8 flex-1">
                    <FontAwesomeIcon icon={faChartPie} className="text-5xl text-primary" />
                    <div className="flex flex-col">
                        <h1 className="text-2xl text-primary font-semibold h-fit whitespace-nowrap">Taux Qualité</h1>
                        <p className="text-md text-primary text-opacity-40 tracking-widest whitespace-nowrap">TABLEAU DE BORD</p>
                    </div>
                </div>
                <Link 
                    className="flex flex-row items-center gap-4 w-fit bg-primary bg-opacity-10 rounded-md px-[20px] py-[10px]
                        hover:bg-opacity-20 transition duration-300 ease-in-out cursor-pointer"
                    href="/quality/evaluations/search">
                    <FontAwesomeIcon 
                        icon={faArrowRight} 
                        className="text-sm text-primary"
                    />
                    <span className="text-md font-normal text-primary whitespace-nowrap">Historique des évaluations</span>
                </Link>
            </div>
            <div className="w-full h-full flex flex-col gap-4">
                <div className="flex flex-row flex-wrap gap-4 min-h-[400px] min-[1070px]:h-[400px]">
                    <CurrentMonthlyAssessmentWidget 
                        moisCycle={getLatestMonth()}
                        cycleStartDate={getCycleStartDate()}
                    />
                    <CurrentCycleWidget 
                        cycle={cycles.find(cycle => cycle.id === currentCycleId)}
                    />
                    <SettingsWidget />
                </div>
                <CyclesWidget 
                    cycles={cycles.filter(cycle => cycle.id !== currentCycleId)}
                    onRefresh={() => router.replace(router.asPath)}
                />
            </div>
        </main>
    )

}



export const getServerSideProps: GetServerSideProps<Props> = async (context) => {

    const session = (await getSession(context)) as MySession | null

    const emptyProps: { props: Props } = {
        props: {
            cycles: [],
            currentCycleId: null
        }
    }

    if(!session) return emptyProps
    
    // make a request to the api to get the cycles from the database

    const cycles = await SSRmakeAPIRequest<Cycle[], Cycle[]>({
        session,
        verb: 'get',
        itemType: 'cycles',
        onSuccess: res => res.data
    })

    // make a request to the api to get the current cycle & its id

    const currentCycle = await SSRmakeAPIRequest<Cycle, Cycle>({
        session,
        verb: 'get',
        itemType: 'cycles',
        additionalPath: "current",
        onSuccess: res => res.data,
        onFailure: err => console.log(err)
    })

    const currentCycleId = currentCycle?.id


    return {
        props: {
            cycles: cycles || [],
            currentCycleId: currentCycleId || null
        }
    }

}

export default Home