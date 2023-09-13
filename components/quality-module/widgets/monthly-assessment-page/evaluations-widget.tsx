import SectionContainer from "@components/layout/quality/section-container"
import { Tabs, TabsList, TabsTrigger } from "@components/radix/tabs";
import { MoisCycle } from "@conf/api/data-types/quality-module";
import { useState } from "react";


interface Props {
    moisCycle: MoisCycle;
    onRefresh: () => void;
}

interface EvalStatusType {
    id: number;
    name: string;
    description: string;
}

const evalStatus: EvalStatusType[] = [
    {
        id: 1,
        name: "Non attribuées",
        description: "Evaluations pas encore attribuées"
    },
    {
        id: 2,
        name: "En cours",
        description: "Evaluations attribuées en attente d’être réalisées"
    },
    {
        id: 3,
        name: "Complétées",
        description: "Evaluations réalisées et complétées par les évaluateurs"
    },
    {
        id: 4,
        name: "Validées",
        description: "Evaluations validées par le responsable qualité"
    }
]

const EvaluationsWidget = (
    {
        moisCycle,
        onRefresh
    }: Props
) => {

    const [selectedStatus, setSelectedStatus] = useState<EvalStatusType>(evalStatus[1])



    // render

    return (
        <SectionContainer>
            <Tabs value={selectedStatus.name} onValueChange={v => setSelectedStatus(evalStatus.find(status => status.name === v) as EvalStatusType)}>
                <TabsList>
                    {evalStatus.map(status => (
                        <TabsTrigger key={status.id} value={status.name}>
                            {status.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </SectionContainer>
    )
}

export default EvaluationsWidget