import BarChart from "@components/charts/bar-chart";
import SectionContainer from "@components/layout/quality/section-container"
import { Cycle } from "@conf/api/data-types/quality-module";



interface Props {
    cycle: Cycle;
}

const GraphWidget = (
    {
        cycle
    }: Props
) => {

    // utils

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
        <SectionContainer>
            <div className="flex flex-col">
                <h3 className="text-xl font-semibold text-primary">Taux qualité annuel</h3>
                <p className="text-md font-normal text-primary/60">Pour le cycle en cours</p>
            </div>
            <div className="w-full flex flex-col items-center justify-center">
                <BarChart
                    label="Note qualité"
                    data={getChartData(cycle)}
                    labels={getLabels(cycle)}
                    onDownloadLinkReady={() => {}}
                />
            </div>
        </SectionContainer>
    )
}

export default GraphWidget