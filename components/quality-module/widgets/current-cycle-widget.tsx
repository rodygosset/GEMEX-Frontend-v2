import { useState } from "react"
import DashboardWidget from "./dashboard-widget"
import { Cycle } from "@conf/api/data-types/quality-module"
import Image from "next/image"

interface Props {
    cycle?: Cycle;
}

const CurrentCycleWidget = (
    {
        cycle
    }: Props
) => {

    // utils

    const getCycleYear = (cycle: Cycle) => `${new Date(cycle.date_debut).getFullYear()}`
        

    // render

    return (
        <DashboardWidget
            title={cycle ? getCycleYear(cycle) : "Cycle en cours"}
            caption="Gérer le cycle d’évaluation en cours"
            link={cycle ? `/quality/cycles/${cycle.id}` : ''}>
                
            {
                cycle ?
                <></>
                :
                // show the no results image if there is no current cycle
                <div className="h-full w-full flex flex-col items-center justify-center gap-4">
                    <div className="h-full max-h-[210px] relative aspect-[1.226]">
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
                    <p className="text-md font-normal text-primary/60">Aucun cycle en cours</p>
                </div>
            }

        </DashboardWidget>
    )
}

export default CurrentCycleWidget