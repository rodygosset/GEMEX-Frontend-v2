import Button from "@components/button"
import SectionContainer from "@components/layout/quality/section-container"
import { Cycle } from "@conf/api/data-types/quality-module";
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"

interface Props {
    cycles: Cycle[];
}

const CyclesWidget = (
    {
        cycles
    }: Props
) => {

    // render

    return (
        <SectionContainer>
            <div className="w-full flex flex-row justify-between content-center">
                <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-primary">Cycles passés</h3>
                    <p className="text-sm font-normal text-primary text-opacity-60">Cycles d’évaluation annuels cloturés</p>
                </div>   
                <Button
                    icon={faPlus}
                    role="secondary"
                    onClick={() => {}}>
                    Nouveau cycle
                </Button>
            </div>
            {
                cycles.length > 0 ?
                <></>
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
                    <p className="text-md font-normal text-primary/60">Aucun cycle d’évaluation</p>
                </div>

            }
        </SectionContainer>
    )

}

export default CyclesWidget