import SectionContainer from "@components/layout/quality/section-container"
import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "@components/radix/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/radix/tabs";
import { Evaluation, MoisCycle } from "@conf/api/data-types/quality-module";
import { useState } from "react";
import EvaluationTableRow from "./evaluation-table-row";
import DeleteDialog from "@components/modals/delete-dialog";


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

    const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null)
    const [selectedEvaluationTitle, setSelectedEvaluationTitle] = useState<string>("")
    const [deleteDialogIsVisible, setDeleteDialogIsVisible] = useState(false)


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
                                <Table className="w-full space-y-[8px]">
                                    <TableCaption>
                                        {status.description}
                                    </TableCaption>
                                    <TableHeader className="max-md:hidden">
                                        <TableRow className="flex items-center pb-[8px] border-b border-primary/10">
                                            <TableHead>Thématique & exposition</TableHead>
                                            <TableHead>Élément évalué</TableHead>
                                            <TableHead>Évaluateur</TableHead>
                                            <TableHead>Date de retour prévue</TableHead>
                                            <TableHead className="w-[72px] flex-initial"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {status.getEvaluations(moisCycle).map((evaluation, index) => (
                                            <EvaluationTableRow 
                                                key={evaluation.id} 
                                                evaluation={evaluation} 
                                                className={index == status.getEvaluations(moisCycle).length - 1 ? "" : "border-b border-primary/10"}
                                                onDelete={title => {
                                                    setSelectedEvaluation(evaluation)
                                                    setSelectedEvaluationTitle(title)
                                                    setDeleteDialogIsVisible(true)
                                                }}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        ))
                    }
                </Tabs>
            </SectionContainer>
            <DeleteDialog
                itemType="evaluations"
                itemTitle={selectedEvaluationTitle}
                customItemID={`id/${selectedEvaluation?.id}`}
                isVisible={deleteDialogIsVisible}
                closeDialog={() => setDeleteDialogIsVisible(false)}
                goBackOnSuccess={false}
                onSuccess={onRefresh}
            />
        </>
    )
}

export default EvaluationsWidget