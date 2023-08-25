import DashboardWidget from "./dashboard-widget"


const CurrentCycleWidget = () => {

    const cycle = {
        id: 1
    }

    // render

    return (
        <DashboardWidget
            title="2023"
            caption="Gérer le cycle d’évaluation en cours"
            link={`/quality/cycles/${cycle.id}`}>
            
        </DashboardWidget>
    )
}

export default CurrentCycleWidget