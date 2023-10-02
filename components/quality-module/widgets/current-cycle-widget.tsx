import { useEffect, useState } from "react"
import DashboardWidget from "./dashboard-widget"
import { Cycle } from "@conf/api/data-types/quality-module"
import Image from "next/image"
import BarChart from "@components/charts/bar-chart";

interface Props {
    cycle?: Cycle;
}

const CurrentCycleWidget = (
    {
        cycle
    }: Props
) => {

    // utils

    const getCycleYear = (cycle: Cycle) => `${new Date(cycle.date_debut).getFullYear()}`
      
    
    useEffect(() => {
        if (cycle) {
            getLabels(cycle)
            console.log(getNbMonths(cycle))
            console.log(getChartData(cycle))
        }
    }, [cycle])

    const getLabels = (cycle: Cycle) => {
        // get the names of the months between the start and end dates of the cycle in an array
        const months = []
        // get the start and end dates of the cycle
        const startDate = new Date(cycle.date_debut)
        const endDate = new Date(cycle.date_fin)
        // for each month between the start and end dates, add the name of the month to the array
        for (let i = startDate; i <= endDate; i.setMonth(i.getMonth() + 1)) {
            let month = i.toLocaleString('fr-fr', { month: 'long' })
            // capitalize the first letter of the month name && add it to the array
            months.push(month.charAt(0).toUpperCase() + month.slice(1) + " " + i.getFullYear())
        }
        return months
    }

    const getNbMonths = (cycle: Cycle) => {
        // get the start and end dates of the cycle
        const startDate = new Date(cycle.date_debut)
        const endDate = new Date(cycle.date_fin)
        // get the number of months between the start and end dates
        const nbMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1
        return nbMonths
    }

    const getChartData = (cycle: Cycle) => {
        const nbMonths = getNbMonths(cycle)
        // for each month of the cycle, add the satisfaction rate to the array
        const data = []
        for (let i = 0; i < nbMonths; i++) {
            if(i < cycle.mois_cycle.length) {
                data.push(cycle.mois_cycle[i].note || 0)
            } else {
                data.push(0)
            }
        }
        return data
    }
    // render

    return (
        <DashboardWidget
            title={cycle ? getCycleYear(cycle) : "Cycle en cours"}
            caption="Gérer le cycle en cours"
            link={cycle ? `/quality/cycles/${cycle.id}` : ''}>
                
            {
                cycle ?
                <div className="h-full min-h-[210px] flex flex-col items-center justify-center">
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
                        data={getChartData(cycle)}
                        labels={getLabels(cycle)}
                        onDownloadLinkReady={() => {}}
                    />
                </div>
                :
                // show the no results image if there is no current cycle
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
                    <p className="text-base font-normal text-blue-600/60">Aucun cycle en cours</p>
                </div>
            }

        </DashboardWidget>
    )
}

export default CurrentCycleWidget