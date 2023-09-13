import BarChart from "@components/charts/bar-chart";
import SectionContainer from "@components/layout/quality/section-container";
import { Cycle, Evaluation, MoisCycle, Thematique } from "@conf/api/data-types/quality-module";
import { MySession } from "@conf/utility-types";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAPIRequest from "@hook/useAPIRequest";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface ThematiqueData {
    id: number;
    nom: string;
    note: number;
}


interface Props {
    moisCycle: MoisCycle;
}


const ChartWidget = (
    {
        moisCycle
    }: Props
) => {


    const session = useSession().data as MySession | null
    const makeAPIRequest = useAPIRequest()

    // state

    const [thematiques, setThematiques] = useState<ThematiqueData[]>([])
    const [imageLink, setImageLink] = useState<string>("")

    // utils

    const getThematiques = async () => {
        if(!session) return
        return makeAPIRequest<Thematique[], Thematique[]>(
            session,
            "get",
            "thematiques",
            undefined,
            undefined,
            res => res.data
        )
    }
    
    // effects


    const getThematiqueNote = async (id: number) => {
        if(!session || !moisCycle) return

        // get all the Evaluations for the given thematique
        // and filter out those that aren't part of the current cycle
        // then keep only the notes from the latest monthly assessment

        const currentCycle = await makeAPIRequest<Cycle, Cycle>(
            session,
            "get",
            "cycles",
            `id/${moisCycle.cycle_id}`,
            undefined,
            res => res.data
        )

        if(!currentCycle || currentCycle instanceof Error) return

        const note = await makeAPIRequest<Evaluation[], number>(
            session,
            "post",
            "evaluations",
            "search",
            {
                thematiques: [id],
            },
            res => {
                const evals = res.data.filter(e => 
                    e.note
                    && currentCycle.mois_cycle.find(moisCycle => moisCycle.id === e.mois_cycle_id)
                )
                const latestMonthlyAssessmentId = Math.max(...evals.map(e => e.mois_cycle_id))
                return evals.filter(e => e.mois_cycle_id == latestMonthlyAssessmentId).reduce((acc, curr) => acc + (curr.note || 0), 0) / currentCycle.mois_cycle.length
            }
        )

        return note && !(note instanceof Error) ? note : 0
    }

    useEffect(() => {
        if(!session) return

        const getNote = (moisCycle: MoisCycle, thematiqueId: number) => {
            let note = moisCycle.thematiques.find(moisCycleThematique => moisCycleThematique.thematique_id === thematiqueId)?.note
            if(typeof note === "number") return note
            return getThematiqueNote(thematiqueId)
        }

        getThematiques().then(async thematiques => { 
            if(!thematiques || thematiques instanceof Error) return
            const data: ThematiqueData[] = []
            for(const thematique of thematiques) {
                const note = await getNote(moisCycle, thematique.id)
                data.push({
                    id: thematique.id,
                    nom: thematique.nom,
                    note: note || 0
                })
            }
            setThematiques(data)
        })
    }, [session])

    // useful functions

    const getLabels = () => thematiques.map(thematique => thematique.nom)

    const getChartData = () => thematiques.map(thematique => thematique.note)

    const getDistanceToGoal = (note: number) => {
        // goal is 16/20
        return note - 16
    }


    // handle downloads

    const dataToCSV = () => {
        const data = getChartData()
        const labels = getLabels()
        let csv = "data:text/csv;charset=utf-8,"
        csv += "Thématique,Note qualité\n"
        for(let i = 0; i < data.length; i++) {
            csv += labels[i] + "," + data[i] + "\n"
        }
        return encodeURI(csv)
    }



    // render

    return (
        <SectionContainer>
            <div className="w-full flex flex-row justify-between max-[480px]:flex-col">
                <div className="flex flex-col">
                    <h3 className="text-xl font-semibold text-primary">Taux qualité</h3>
                    <p className="text-base font-normal text-primary/60">Pour l'évaluation mensuelle</p>
                </div>
                <div className="flex flex-col items-end max-[480px]:items-start">
                    <span>
                        <b className={`text-3xl ${
                            (moisCycle.note || 0) < 10 ? "text-error" : (moisCycle.note || 0) < 15 ? "text-warning" : "text-success"
                        }`}>
                            { moisCycle.note || 0 }
                        </b> 
                        <span className="text-sm font-normal text-primary/80">/20</span>
                    </span>
                    <span className="text-end max-[480px]:text-start">
                        <b className={`text-sm ${
                            getDistanceToGoal(moisCycle.note || 0) < 0 ? "text-error" : getDistanceToGoal(moisCycle.note || 0) < 5 ? "text-warning" : "text-success"
                        }`}>
                            { getDistanceToGoal(moisCycle.note || 0) }
                        </b>
                        <span className="text-sm font-normal text-primary/80"> par rapport à l'objectif</span>
                    </span>
                </div>
            </div>
            <div className="w-full flex flex-col gap-4">
                <div className="w-full flex flex-col items-center justify-center h-[300px]">
                    <BarChart
                        options={{
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    max: 20
                                }
                            }
                        }}
                        label="Note qualité"
                        data={getChartData()}
                        labels={getLabels()}
                        onDownloadLinkReady={setImageLink}
                    />
                </div>
                <div className="w-full flex flex-row gap-4 max-[480px]:flex-wrap">
                    <a
                        className="w-full bg-primary/10 rounded-[8px] px-[16px] py-[8px] 
                        flex flex-row justify-center items-center gap-4 hover:bg-primary/20 transition duration-300 ease-in-out cursor-pointer"
                        download={`graphique-taux-qualite-${moisCycle.mois}.png`}
                        href={imageLink}>
                        <FontAwesomeIcon icon={faDownload} className="text-primary" />
                        <span className="font-normal text-sm text-primary whitespace-nowrap">Télécharger l'image</span>
                    </a>
                    <a
                        className="w-full bg-primary rounded-[8px] px-[16px] py-[8px] 
                        flex flex-row justify-center items-center gap-4 hover:shadow-2xl hover:shadow-primary transition duration-300 ease-in-out cursor-pointer"
                        download={`resultats-taux-qualite-${moisCycle.mois}.csv`}
                        href={dataToCSV()}>
                        <FontAwesomeIcon icon={faDownload} className="text-white" />
                        <span className="text-sm font-normal text-white whitespace-nowrap">Export Excel</span>
                    </a>
                </div>
            </div>
        </SectionContainer>
    )

}

export default ChartWidget