import SectionContainer from "@components/layout/quality/section-container"



const ExpositionsWidget = () => {


    // render

    return (
        <SectionContainer>
            <div className="flex flex-col">
                <h3 className="text-xl font-semibold text-primary">Expositions</h3>
                <p className="text-md font-normal text-primary/60">Les expositions planifiées pour évaluation durant ce cycle</p>
            </div>
        </SectionContainer>
    )
}

export default ExpositionsWidget