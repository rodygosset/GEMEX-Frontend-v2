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
        monthStartDate.setMonth(monthStartDate.getMonth() + currentMoisCycle.mois)

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
                <></>
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
                    <p className="text-md font-normal text-primary/60">Aucune évaluation mensuelle en cours</p>
                </div>
            }
        </DashboardWidget>
    )
}

export default CurrentMonthlyAssessmentWidget