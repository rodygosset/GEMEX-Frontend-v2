import DashboardWidget from "./dashboard-widget"
import { MoisCycle } from "@conf/api/data-types/quality-module"

import Image from "next/image"

interface Props {
    moisCycle?: MoisCycle;
    cycleStartDate?: Date;
}


const CurrentMonthlyAssessmentWidget = (
    {
        moisCycle,
        cycleStartDate
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

    // render

    return (
        <DashboardWidget
            title={moisCycle && cycleStartDate ? getMonthAndYear(moisCycle, cycleStartDate) : "Évaluation mensuelle"}
            caption="Gérer l’évaluation mensuelle"
            link={moisCycle ? `/quality/monthly-assessments/${moisCycle.id}` : ''}>

            {
                moisCycle ?
                <div className="min-h-[210px] h-full w-full flex flex-col items-center justify-center">
                    <div className="flex flex-row items-center justify-center w-full gap-16">
                        <div className={`h-[1px] flex-1 ${ (moisCycle.note || 0) >= 16 ? 'bg-success/20' : ''} ${ (moisCycle.note || 0) >= 15 && (moisCycle.note || 0) < 16 ? 'bg-warning/20' : ''} ${ (moisCycle.note || 0) < 15 ? 'bg-error/20' : ''}`}></div>
                        <span className={`text-[12rem] ${ (moisCycle.note || 0) >= 16 ? 'text-success' : ''} ${ (moisCycle.note || 0) >= 15 && (moisCycle.note || 0) < 16 ? 'text-warning' : ''} ${ (moisCycle.note || 0) < 15 ? 'text-error' : ''}`}>
                            { (moisCycle.note || 0) }
                        </span>
                        <div className={`h-[1px] flex-1 ${ (moisCycle.note || 0) >= 16 ? 'bg-success/20' : ''} ${ (moisCycle.note || 0) >= 15 && (moisCycle.note || 0) < 16 ? 'bg-warning/20' : ''} ${ (moisCycle.note || 0) < 15 ? 'bg-error/20' : ''}`}></div>
                    </div>
                    <p className={`text-md font-normal text-center w-fit ${ (moisCycle.note || 0) >= 16 ? 'text-success/60' : ''} ${ (moisCycle.note || 0) >= 15 && (moisCycle.note || 0) < 16 ? 'text-warning/60' : ''} ${ (moisCycle.note || 0) < 15 ? 'text-error/60' : ''}`}>Moyenne du mois</p>
                </div>
                :
                // show the no results image if there is no ongoing monthly assessment
                <div className="h-full w-full flex flex-col items-center justify-center gap-4">
                    <div className="h-full max-h-[210px] relative aspect-[1.226]">
                        <Image 
                            quality={100}
                            src={'/images/no-results-illustration.svg'} 
                            alt={"Aucun résultat."} 
                            priority
                            fill
                            style={{ 
                                objectFit: "contain", 
                                top: "auto"
                            }}
                        />
                    </div>
                    <p className="text-md font-normal text-primary/60">Aucune évaluation en cours</p>
                </div>
            }
        </DashboardWidget>
    )
}

export default CurrentMonthlyAssessmentWidget