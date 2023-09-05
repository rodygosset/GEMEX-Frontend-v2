import Button from "@components/button"
import SectionContainer from "@components/layout/quality/section-container"
import { Cycle } from "@conf/api/data-types/quality-module"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import ExpositionListItem from "./exposition-list-item";


interface Props {
    cycle: Cycle;
}

const ExpositionsWidget = (
    {
        cycle
    }: Props
) => {


    // render

    return (
        <SectionContainer heightFit>
            <div className="w-full flex flex-row max-md:flex-col gap-4">
                <div className="flex flex-col flex-1">
                    <h3 className="text-xl font-semibold text-primary">Expositions</h3>
                    <p className="text-base font-normal text-primary/60">Les expositions planifiées pour évaluation durant ce cycle</p>
                </div>
                <Button
                    icon={faPlus}
                    role="secondary"
                    onClick={() => {}}>
                    Ajouter une exposition
                </Button>
            </div>
            <ul className="w-full flex flex-row flex-wrap gap-4">
            {
                cycle.expositions.length > 0 ?
                cycle.expositions.map(exposition => (
                    <ExpositionListItem 
                        cycle={cycle}
                        expositionId={exposition.exposition_id}
                    />
                ))
                : <p className="text-base font-normal text-primary/60">Aucune exposition planifiée pour ce cycle</p>
            }
            </ul>
        </SectionContainer>
    )
}

export default ExpositionsWidget