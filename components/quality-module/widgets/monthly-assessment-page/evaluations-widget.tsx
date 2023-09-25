import SectionContainer from "@components/layout/quality/section-container"
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "@components/radix/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/radix/tabs";
import { Evaluation, MoisCycle } from "@conf/api/data-types/quality-module";
import { useState } from "react";
import EvaluationTableRow from "./evaluation-table-row";
import DeleteDialog from "@components/modals/delete-dialog";
import EvaluationsTable from "./evaluations-table";


interface Props {
    moisCycle: MoisCycle;
    onRefresh: () => void;
}

interface EvalStatusType {
    id: number;
    name: string;
    description: string;
    getEvaluations: (moisCycle: MoisCycle) => Evaluation[];
}

const evalStatus: EvalStatusType[] = [
    {
        id: 1,
        name: "En cours",
        description: "Evaluations attribuées en attente d’être réalisées",
        getEvaluations: moisCycle => moisCycle.evaluations.filter(evaluation => evaluation.note === null)
    },
    {
        id: 2,
        name: "Complétées",
        description: "Evaluations réalisées et complétées par les évaluateurs",
        getEvaluations: moisCycle => moisCycle.evaluations.filter(evaluation => evaluation.note !== null)
    },
    {
        id: 3,
        name: "Validées",
        description: "Evaluations validées par le responsable qualité",
        getEvaluations: moisCycle => moisCycle.evaluations.filter(evaluation => evaluation.approved)
    }
]

const EvaluationsWidget = (
    {
        moisCycle,
        onRefresh
    }: Props
) => {

    const [selectedStatus, setSelectedStatus] = useState<EvalStatusType>(evalStatus[0])

    // render

    return (
        <>
            <SectionContainer>
                <Tabs 
                    className="flex flex-col gap-[32px] items-start"
                    value={selectedStatus.name} 
                    onValueChange={v => setSelectedStatus(evalStatus.find(status => status.name === v) as EvalStatusType)}>
                    <TabsList>
                        {evalStatus.map(status => (
                            <TabsTrigger key={status.id} value={status.name}>
                                {status.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {
                        evalStatus.map(status => (
                            <TabsContent 
                                className="w-full"
                                value={status.name} 
                                key={status.id}>
                                <EvaluationsTable
                                    evaluations={status.getEvaluations(moisCycle)}
                                    description={status.description}
                                    onRefresh={onRefresh}
                                />
                            </TabsContent>
                        ))
                    }
                </Tabs>
            </SectionContainer>
        </>
    )
}

export default EvaluationsWidget