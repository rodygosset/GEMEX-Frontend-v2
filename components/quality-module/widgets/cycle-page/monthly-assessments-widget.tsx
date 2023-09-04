import SectionContainer from "@components/layout/quality/section-container"


const MonthlyAssessmentsWidget = () => {


    // render

    return (
        <SectionContainer>
            <div className="flex flex-col">
                <h3 className="text-xl font-semibold text-primary">Évaluations mensuelles</h3>
                <p className="text-md font-normal text-primary/60">Résultats des évaluations des mois passés</p>
            </div>
        </SectionContainer>
    )

}

export default MonthlyAssessmentsWidget