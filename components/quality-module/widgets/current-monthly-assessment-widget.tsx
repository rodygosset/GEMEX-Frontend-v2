import SectionContainer from "@components/layout/quality/section-container"
import DashboardWidget from "./dashboard-widget"



const CurrentMonthlyAssessmentWidget = () => {


    const monthlyAssessment = {
        id: 1
    }

    // render

    return (
        <DashboardWidget
            title="Aout 2023"
            caption="Gérer l’évaluation mensuelle"
            link={`/quality/monthly-assessments/${monthlyAssessment.id}`}>
        </DashboardWidget>
    )
}

export default CurrentMonthlyAssessmentWidget