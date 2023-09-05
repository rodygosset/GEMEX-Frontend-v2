import Button from "@components/button"
import SectionContainer from "@components/layout/quality/section-container"
import CycleFormModal from "@components/modals/quality-module/cycle-form-modal";
import { Cycle } from "@conf/api/data-types/quality-module";
import { faCircle, faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image"
import Link from "next/link";
import { useState } from "react";

interface Props {
    cycles: Cycle[];
    onRefresh: () => void;
}

const CyclesWidget = (
    {
        cycles,
        onRefresh
    }: Props
) => {

    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false)

    // utils

    const getCycleYear = (cycle: Cycle) => new Date(cycle.date_debut).getFullYear()

    const getDistanceToGoal = (note: number) => {
        // goal is 16/20
        return note - 16
    }

    // render

    return (
        <>
            <SectionContainer>
                <div className="w-full flex flex-row justify-between content-center max-[520px]:flex-col gap-4">
                    <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-primary">Cycles passés</h3>
                        <p className="text-sm font-normal text-primary text-opacity-60">Cycles d’évaluation annuels cloturés</p>
                    </div>   
                    <Button
                        icon={faPlus}
                        role="secondary"
                        onClick={() => setModalIsOpen(true)}>
                        Nouveau cycle
                    </Button>
                </div>
                {
                    cycles.length > 0 ?
                    <ul className="w-full flex flex-row flex-wrap gap-4">
                    {
                        cycles.map(cycle => (
                            <li 
                                className="flex-1 rounded-[8px] hover:bg-primary/10 transition duration-300 ease-in-out cursor-pointer"
                                key={cycle.id}>
                                <Link
                                    className="w-full flex flex-col p-[16px] whitespace-nowrap" 
                                    href={`/quality/cycles/${cycle.id}`}>
                                    <span className="flex flex-row items-center gap-4">
                                        <span className="text-base font-semibold text-primary">{ getCycleYear(cycle) }</span>
                                        <FontAwesomeIcon icon={faCircle} className="text-primary/40 text-[0.4rem]" />
                                        <span className={`text-xl font-semibold ${
                                            (cycle.note || 0) < 15 ? 'text-error' : (cycle.note || 0) < 16 ? 'text-warning' : 'text-success'
                                        }`}>
                                            { cycle.note || 0 }
                                        </span>
                                    </span>
                                    <span className="flex flex-row items-center gap-2 text-sm">
                                        <b className={
                                            getDistanceToGoal(cycle.note || 0) > 0 ? 'text-success' : 'text-error'
                                        }>
                                            { getDistanceToGoal(cycle.note || 0) }
                                        </b> 
                                        <span className="text-primary/60">{ getDistanceToGoal(cycle.note || 0) > 0 ? "au-dessus" : "en-dessous" } de l'objectif</span>
                                    </span>
                                </Link>
                            </li>
                        ))
                    }
                    </ul>
                
                    :
                    // show the no results image if there is no cycle at all in the database
                    <div className="h-full w-full flex flex-col items-center justify-center gap-4">
                        <div className="h-[210px] relative aspect-[1.226]">
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
                        <p className="text-base font-normal text-primary/60">Aucun cycle d’évaluation passé</p>
                    </div>

                }
            </SectionContainer>
            <CycleFormModal
                isOpen={modalIsOpen}
                onClose={() => setModalIsOpen(false)}
                onSubmit={onRefresh}
            />
        </>
    )

}

export default CyclesWidget