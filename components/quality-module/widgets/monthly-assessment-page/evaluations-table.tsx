import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "@components/radix/table"
import EvaluationTableRow from "./evaluation-table-row"
import { Evaluation } from "@conf/api/data-types/quality-module"
import DeleteDialog from "@components/modals/delete-dialog"
import { useState } from "react"

interface Props {
	description: string
	evaluations: Evaluation[]
	onRefresh: () => void
}

const EvaluationsTable = ({ description, evaluations, onRefresh }: Props) => {
	// state

	const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | undefined>()
	const [selectedEvaluationTitle, setSelectedEvaluationTitle] = useState("")
	const [deleteDialogIsVisible, setDeleteDialogIsVisible] = useState(false)

	// render

	return (
		<>
			<Table className="w-full space-y-[8px]">
				<TableCaption>{description}</TableCaption>
				<TableHeader className="max-md:hidden">
					<TableRow className="flex items-center pb-[8px] border-b border-primary/10">
						<TableHead className="max-w-[72px]">Note</TableHead>
						<TableHead>Thématique & exposition</TableHead>
						<TableHead>Élément évalué</TableHead>
						<TableHead>Évaluateur</TableHead>
						<TableHead>Date de retour prévue</TableHead>
						<TableHead className="w-[72px] flex-initial"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{evaluations.map((evaluation, index) => (
						<EvaluationTableRow
							key={evaluation.id}
							evaluation={evaluation}
							className={index == evaluations.length - 1 ? "" : "border-b border-primary/10"}
							onDelete={(title) => {
								setSelectedEvaluation(evaluation)
								setSelectedEvaluationTitle(title)
								setDeleteDialogIsVisible(true)
							}}
						/>
					))}
				</TableBody>
			</Table>
			<DeleteDialog
				itemType="evaluations"
				itemTitle={selectedEvaluationTitle}
				customItemID={`id/${selectedEvaluation?.id}`}
				open={deleteDialogIsVisible}
				onOpenChange={setDeleteDialogIsVisible}
				goBackOnSuccess={false}
				onSuccess={onRefresh}
			/>
		</>
	)
}

export default EvaluationsTable
