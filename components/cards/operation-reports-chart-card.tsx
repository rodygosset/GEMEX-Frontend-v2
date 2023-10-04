import BarChart from "@components/charts/bar-chart"
import { Fiche } from "@conf/api/data-types/fiche"
import { MySession } from "@conf/utility-types"
import useAPIRequest from "@hook/useAPIRequest"
import { cn } from "@utils/tailwind"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

const labels = [
    "Opérations",
    "Pannes",
    "Systématiques",
]

const OperationReportsChartCard = () => {

    const [data, setData] = useState<number[]>([])

    // get data for each type of fiche

    const makeAPIRequest = useAPIRequest()
    const session = useSession().data as MySession | null

    const getFicheTypeCount = async (type: string) => {
        if(!session) return

        return await makeAPIRequest<{nb_results: number}, number>(
            session,
            "post",
            "fiches",
            "search/nb",
            {
                groups: session.user.groups.length > 0 ? [session.user.groups[0]] : [],
                status_id: 2,
                is_active: true,
                tags: [type]
            },
            res => res.data.nb_results
        )
    }

    useEffect(() => {
        const fetchData = async () => {
            const fiches = await Promise.all([
                getFicheTypeCount("Opération"),
                getFicheTypeCount("Panne"),
                getFicheTypeCount("Systématique")
            ])

            console.log("fiches count : ", fiches)

            setData(fiches.map(fiche => fiche && !(fiche instanceof Error) ? fiche : 0))
        }

        fetchData()
    }, [session])

    // render

    return (
        <section className={cn(
            "w-full flex-1 h-full p-[32px] rounded-[8px] border border-blue-600/20 shadow-2xl shadow-blue-600/20",
            "flex flex-col gap-[16px]"
        )}>
            <div className="flex flex-col">
                <h3 className="text-base font-semibold text-blue-600">Vue d'ensemble</h3>
                <span className="text-sm font-normal text-blue-600/60">Fiches en cours dans le groupe</span>
            </div>
            <div className="w-full flex flex-col items-center justify-center min-h-[200px] h-full">
                <BarChart
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 20
                            }
                        }
                    }}
                    label="Nombre de fiches"
                    data={data}
                    labels={labels}
                />
            </div>
        </section>
    )
}

export default OperationReportsChartCard