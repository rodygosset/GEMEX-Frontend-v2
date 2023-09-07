import Button from "@components/button"
import SectionContainer from "@components/layout/quality/section-container"
import { Cycle } from "@conf/api/data-types/quality-module"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import ExpositionListItem from "./exposition-list-item";
import useAPIRequest from "@hook/useAPIRequest";
import { MySession } from "@conf/utility-types";
import { useSession } from "next-auth/react";
import { useState } from "react";
import AddExpoModal from "@components/modals/quality-module/add-expo-modal";


interface Props {
    cycle: Cycle;
    onRefresh: () => void;
}

const ExpositionsWidget = (
    {
        cycle,
        onRefresh
    }: Props
) => {

    // state

    const [modalIsOpen, setModalIsOpen] = useState(false)

    // handlers

    const makeAPIRequest = useAPIRequest()
    const session = useSession().data as MySession | null

    // update the cycle to add the exposition to the list

    const handleAddExposition = (expositionId: number) => {
        if(!session) return

        makeAPIRequest<Cycle, void>(
            session,
            'put',
            'cycles',
            `id/${cycle.id}`,
            {
                expositions: [...cycle.expositions.map(e => e.exposition_id), expositionId]
            },
            onRefresh
        )
    }


    // render

    return (
        <>
            <SectionContainer heightFit>
                <div className="w-full flex flex-row max-md:flex-col gap-4">
                    <div className="flex flex-col flex-1">
                        <h3 className="text-xl font-semibold text-primary">Expositions</h3>
                        <p className="text-base font-normal text-primary/60">Les expositions planifiées pour évaluation durant ce cycle</p>
                    </div>
                    <Button
                        icon={faPlus}
                        role="secondary"
                        onClick={() => setModalIsOpen(true)}>
                        Ajouter une exposition
                    </Button>
                </div>
                <ul className="w-full gap-4 grid grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))]">
                {
                    cycle.expositions.length > 0 ?
                    cycle.expositions.map(exposition => (
                        <ExpositionListItem 
                            key={`cycle-${cycle.id}-exposition-${exposition.exposition_id}-list-item`}
                            cycle={cycle}
                            expositionId={exposition.exposition_id}
                            onRefresh={onRefresh}
                        />
                    ))
                    : <p className="text-base font-normal text-primary/60">Aucune exposition planifiée pour ce cycle</p>
                }
                </ul>
            </SectionContainer>
            <AddExpoModal
                isOpen={modalIsOpen}
                onClose={() => setModalIsOpen(false)}
                onSubmit={handleAddExposition}
            />
        </>
    )
}

export default ExpositionsWidget