import SectionContainer from "@components/layout/quality/section-container"
import { Cycle, Domaine, Evaluation, Thematique } from "@conf/api/data-types/quality-module"
import { MySession } from "@conf/utility-types";
import useAPIRequest from "@hook/useAPIRequest";
import { useSession } from "next-auth/react";
import { Fragment, useEffect, useState } from "react"

interface ThematiqueEvaluationDate {
    thematiqueId: number;
    date: Date | null;
}

interface Props {
    cycle: Cycle;
}

const ThematiquesWidget = (
    {
        cycle
    }: Props
) => {

    // state

    const [thematiques, setThematiques] = useState<Thematique[]>([])

    // get all Thematique objects from the API

    const makeAPIRequest = useAPIRequest()
    const session = useSession().data as MySession | null

    useEffect(() => {

        if(!session) return

        makeAPIRequest<Domaine[], void>(
            session,
            "get",
            "domaines",
            undefined,
            undefined,
            res => setThematiques(res.data.map(d => d.thematiques).flat().filter(t => {
                console.log(`thematique ${t.nom} shouldEvaluate: ${shouldEvaluate(t)}`)
                return shouldEvaluate(t) || isUpcoming(t)
            }))
        )

    }, [session])

    // utils

    const getLatestEvaluationDate = (thematiqueId: number) => {
        const evaluations = cycle.mois_cycle.map(mois => mois.evaluations).flat()
        const thematiqueEvaluations = evaluations.filter(evaluation => evaluation.thematique_id === thematiqueId)
        if(thematiqueEvaluations.length === 0) return null
        const latestEvaluation = thematiqueEvaluations.reduce((prev, curr) => prev.date_rendu_reelle > curr.date_rendu_reelle ? prev : curr)
        return new Date(latestEvaluation.date_rendu_reelle)
    }

    // true if the next evaluation date is today or in the past

    const shouldEvaluate = (thematique: Thematique) => {
        const latestEvalDate = getLatestEvaluationDate(thematique.id)
        if(!latestEvalDate) return true
        const nextEvalDate = new Date(latestEvalDate)
        nextEvalDate.setMonth(nextEvalDate.getMonth() + thematique.periodicite)
        return new Date() >= nextEvalDate
    }

    // true if the next evaluation date is max 3 months away

    const isUpcoming = (thematique: Thematique) => {
        const latestEvalDate = getLatestEvaluationDate(thematique.id)
        if(!latestEvalDate) return false
        const nextEvalDate = new Date(latestEvalDate)
        nextEvalDate.setMonth(nextEvalDate.getMonth() + thematique.periodicite)
        return new Date() <= nextEvalDate && new Date() >= new Date(nextEvalDate.getFullYear(), nextEvalDate.getMonth() - 3, nextEvalDate.getDate())
    }

    // render

    return (
        <SectionContainer>
            <div className="flex flex-col">
                <h3 className="text-xl font-semibold text-primary">Prochaines thématiques</h3>
                <p className="text-base font-normal text-primary/60">Prochaines thématiques à évaluer</p>
            </div>
            <ul className="w-full flex flex-col gap-4 sm:mt-8">
                <li className="w-full flex flex-row items-center max-sm:hidden">
                    <span className="text-base text-primary/60 font-normal flex-1">Thématiques</span>
                    <span className="text-base text-primary/60 font-normal flex-1">Dernière évaluation</span>
                    <span className="text-base text-primary/60 font-normal flex-1">Périodicité</span>
                    <span className="w-[40px] h-[40px]"></span>
                </li>
                <div className="w-full h-[1px] bg-primary/10"></div>
                {
                    thematiques.length > 0 ?
                    thematiques.map((thematique, index) => (
                        <Fragment key={thematique.id}>
                            <li
                                className="w-full flex flex-row items-center gap-4 py-[16px]">
                                <div 
                                    className="w-full flex flex-row items-center flex-1
                                            max-sm:flex-col max-sm:items-start">
                                    <div className="flex flex-row flex-wrap gap-4 flex-1 items-center
                                            max-sm:flex-col max-sm:items-start">
                                        {
                                            shouldEvaluate(thematique) ?
                                            <span className="text-sm font-normal text-warning px-[8px] py-[4px]
                                                        border border-warning/20 rounded-lg bg-warning/10">
                                                À évaluer
                                            </span>
                                            : <></>
                                        }
                                        <span className="text-base font-normal text-primary">{thematique.nom}</span>
                                    </div>
                                    {
                                        getLatestEvaluationDate(thematique.id) ?
                                        <span className="text-base max-md:text-sm font-normal text-primary/80 flex-1 capitalize">{getLatestEvaluationDate(thematique.id)?.toLocaleDateString("fr-fr", { year: "numeric", month: "long", day: "numeric" })}</span> 
                                        :
                                        <span className="text-base max-md:text-sm font-normal text-primary/80 flex-1">Pas d'évaluation</span>
                                    }
                                    <span className="text-base max-md:text-sm font-normal text-primary/80 flex-1">
                                        À évaluer 
                                        {
                                            thematique.periodicite > 1 ?
                                            ` tous les ${thematique.periodicite} mois` :
                                            ' tous les mois'
                                        }
                                    </span>
                                </div>

                            </li>
                            {
                                index < thematiques.length - 1 ?
                                <div className="w-full h-[1px] bg-primary/10"></div> :
                                <></>
                            }
                        </Fragment>
                    ))
                    : <p className="text-base font-normal text-primary/60">Aucune thématique à évaluer</p>
                }
            </ul>
        </SectionContainer>
    )
}

export default ThematiquesWidget