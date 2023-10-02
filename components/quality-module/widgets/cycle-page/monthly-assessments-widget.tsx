import SectionContainer from "@components/layout/quality/section-container"
import { Cycle, MoisCycle } from "@conf/api/data-types/quality-module"
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

interface Props {
    cycle: Cycle;
}

const MonthlyAssessmentsWidget = (
    {
        cycle
    }: Props
) => {

    // utils

    const getMonthAndYear = (currentMoisCycle: MoisCycle, currentCycleStartDate: Date) => {
        // get the month by adding moisCycle.mois (number of months) to the cycle start date
        const monthStartDate = new Date(currentCycleStartDate)
        monthStartDate.setMonth(monthStartDate.getMonth() + currentMoisCycle.mois - 1)

        // capitalize the month the first letter of the month
        const month = monthStartDate.toLocaleString('fr-fr', { month: 'long' })

        // get the year of the cycle start date
        return `${month.charAt(0).toUpperCase() + month.slice(1)} ${monthStartDate.getFullYear()}`
    }

    const getDistanceToGoal = (note: number) => {
        // goal is 16/20
        return note - 16
    }

    const isLatestMonth = (mois: MoisCycle) => {
        if(cycle.mois_cycle.length == 0) return false
        const latestMonth = cycle.mois_cycle.reduce((acc, curr) => {
            if(curr.mois > acc.mois) return curr
            return acc
        })
        return mois.mois === latestMonth.mois
    }


    // render

    return (
        <SectionContainer heightFit>
            <div className="flex flex-col">
                <h3 className="text-xl font-semibold text-blue-600">Évaluations mensuelles</h3>
                <p className="text-base font-normal text-blue-600/60">Résultats des évaluations des mois passés</p>
            </div>
            <ul className="w-full gap-4 mt-4 grid grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))]">
            {
                cycle.mois_cycle.length > 0 ?
                cycle.mois_cycle.map(mois => (
                    <li 
                        className="flex-1 rounded-[8px] hover:bg-blue-600/5 transition duration-300 ease-in-out cursor-pointer"
                        key={mois.id}>
                        <Link
                            className="w-full flex flex-col p-[16px] whitespace-nowrap" 
                            href={`/quality/monthly-assessments/${mois.id}`}>
                            <span className="flex flex-row items-center gap-4">
                                <span className="text-base font-semibold text-blue-600">{ getMonthAndYear(mois, new Date(cycle.date_debut)) }</span>
                                <FontAwesomeIcon icon={faCircle} className="text-blue-600/40 text-[0.4rem]" />
                                <span className={`text-xl font-semibold ${
                                    (mois.note || 0) < 15 ? 'text-error' : (mois.note || 0) < 16 ? 'text-warning' : 'text-success'
                                }`}>
                                    { mois.note || 0 }
                                </span>
                            </span>
                            {
                                isLatestMonth(mois) ?
                                <span className="text-sm font-semibold text-purple-600">En cours</span>
                                : <></>
                            }
                            <span className="flex flex-row items-center gap-2 text-sm">
                                <b className={
                                    getDistanceToGoal(mois.note || 0) > 0 ? 'text-success' : 'text-error'
                                }>
                                    { getDistanceToGoal(mois.note || 0) }
                                </b> 
                                <span className="text-blue-600/60">{ getDistanceToGoal(mois.note || 0) > 0 ? "au-dessus" : "en-dessous" } de l'objectif</span>
                            </span>
                        </Link>
                    </li>
                ))
                : <p className="text-base font-normal text-blue-600/60">Aucune évaluation mensuelle pour ce cycle</p>
            }
            </ul>
        </SectionContainer>
    )

}

export default MonthlyAssessmentsWidget