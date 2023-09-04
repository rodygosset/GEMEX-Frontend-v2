import SectionContainer from "@components/layout/quality/section-container"


const ThematiquesWidget = () => {

    // render

    return (
        <SectionContainer>
            <div className="flex flex-col">
                <h3 className="text-xl font-semibold text-primary">Prochaines thématiques</h3>
                <p className="text-md font-normal text-primary/60">Prochaines thématiques à évaluer</p>
            </div>
        </SectionContainer>
    )
}

export default ThematiquesWidget