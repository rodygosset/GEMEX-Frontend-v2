import { Table, TableBody, TableCaption, TableHead, TableHeader, TableRow } from "@components/radix/table"
import EvaluationTableRow from "./evaluation-table-row"
import { Evaluation } from "@conf/api/data-types/quality-module"
import DeleteDialog from "@components/modals/delete-dialog"
import { useState } from "react"
import EvaluationForm from "@components/radix/evaluation-form"
import { useSession } from "next-auth/react"
import useAPIRequest from "@hook/useAPIRequest"
import { MySession } from "@conf/utility-types"
import { Exposition } from "@conf/api/data-types/exposition"
import { Element } from "@conf/api/data-types/element"

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
	const [evaluationFormIsVisible, setEvaluationFormIsVisible] = useState(false)
	const [evaluationFormExpoName, setEvaluationFormExpoName] = useState("")
	const [evaluationFormElementName, setEvaluationFormElementName] = useState("")

	// utils

	const session = useSession().data as MySession | null
	const makeAPIRequest = useAPIRequest()

	const getExpoName = async (exposition_id: number) => {
		if (!session) return ""
		return await makeAPIRequest<Exposition, string>(session, "get", "expositions", `id/${exposition_id}`, undefined, (res) => res.data.nom)
	}

	const getEvaluationFormData = async (evaluation: Evaluation) => {
		if (!session) return ""

		const element = await makeAPIRequest<Element, Element>(session, "get", "elements", `id/${evaluation.element_id}`, undefined, (res) => res.data)
		if (!element || element instanceof Error) return

		const expo = await getExpoName(element.exposition_id)
		if (!expo || expo instanceof Error) return

		setEvaluationFormExpoName(expo)
		setEvaluationFormElementName(element.nom)
	}

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
							onOpenEvaluationForm={async () => {
								setSelectedEvaluation(evaluation)
								await getEvaluationFormData(evaluation)
								setEvaluationFormIsVisible(true)
							}}
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
			<EvaluationForm
				evaluation={selectedEvaluation}
				open={evaluationFormIsVisible}
				onOpenChange={setEvaluationFormIsVisible}
				onSubmit={onRefresh}
				expoName={evaluationFormExpoName}
				elementName={evaluationFormElementName}
			/>
		</>
	)
}

export default EvaluationsTable
