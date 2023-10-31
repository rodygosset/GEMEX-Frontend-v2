import { Evaluation, Thematique } from "@conf/api/data-types/quality-module"
import { useEffect, useState } from "react"
import { Skeleton } from "./skeleton"
import { useSession } from "next-auth/react"
import { MySession } from "@conf/utility-types"
import useAPIRequest from "@hook/useAPIRequest"
import { Exposition } from "@conf/api/data-types/exposition"
import { Element } from "@conf/api/data-types/element"
import { cn } from "@utils/tailwind"
import EvaluationForm from "./evaluation-form"
import { Button } from "./button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit } from "@fortawesome/free-solid-svg-icons"

interface Props {
	evaluation: Evaluation
	onChange: (evaluation: Evaluation) => void
}

const EvaluationCard = ({ evaluation, onChange }: Props) => {
	const [elementName, setElementName] = useState("")
	const [expoName, setExpoName] = useState("")

	const [thematiqueName, setThematiqueName] = useState("")

	// get the element name & expo name on load

	// start by getting the session

	const session = useSession().data as MySession | null
	const makeAPIRequest = useAPIRequest()

	const getExpoName = async (exposition_id: number) => {
		if (!session) return ""

		return await makeAPIRequest<Exposition, string>(session, "get", "expositions", `id/${exposition_id}`, undefined, (res) => res.data.nom)
	}

	const getThematiqueName = async (thematique_id: number) => {
		if (!session) return ""

		return await makeAPIRequest<Thematique, string>(session, "get", "thematiques", `id/${thematique_id}`, undefined, (res) => res.data.nom)
	}

	const getData = async () => {
		if (!session) return

		const element = await makeAPIRequest<Element, Element>(session, "get", "elements", `id/${evaluation.element_id}`, undefined, (res) => res.data)

		if (!element || element instanceof Error) return

		const expo = await getExpoName(element.exposition_id)
		if (!expo || expo instanceof Error) return

		const thematique = await getThematiqueName(evaluation.thematique_id)
		if (!thematique || thematique instanceof Error) return

		setElementName(element.nom)
		setExpoName(expo)
		setThematiqueName(thematique)
	}

	// run on evaluation change

	useEffect(() => {
		if (!session) return
		getData()
	}, [evaluation, session])

	// utils

	const dateOptions: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric"
	}

	// manage the popover's open / close state

	const [formIsOpen, setFormIsOpen] = useState(false)
	const [viewerIsOpen, setViewerIsOpen] = useState(false)

	// render

	return elementName && expoName && thematiqueName ? (
		<>
			<li className="w-full">
				<div
					onClick={() => (evaluation.date_rendu_reelle ? setViewerIsOpen(!viewerIsOpen) : setFormIsOpen(!formIsOpen))}
					className={cn(
						"w-full flex flex-col items-start text-start gap-[8px] p-[16px] rounded-[8px] border border-blue-600/20",
						"cursor-pointer transition-shadow duration-300 ease-in-out",
						"hover:shadow-blue-600/20 hover:shadow-xl focus:bg-blue-600/10 focus:outline-none focus:ring-offset-blue-600/60",
						"focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
					)}>
					<div className="w-full flex flex-wrap gap-[16px] justify-between">
						<div className="max-w-[296px] flex flex-col flex-1">
							<span className="text-base font-medium text-blue-600 overflow-hidden whitespace-nowrap text-ellipsis">{elementName}</span>
							<span className="text-sm font-normal text-blue-600/60 overflow-hidden whitespace-nowrap text-ellipsis">{expoName}</span>
						</div>
						<span
							className={cn(
								"px-[16px] py-[8px] flex items-center justify-center rounded-[8px] bg-fuchsia-600/10",
								"h-fit text-xs font-medium text-fuchsia-600 max-w-[128px]"
							)}>
							{thematiqueName}
						</span>
					</div>
					<div className="w-full flex flex-wrap justify-between items-center gap-[16px]">
						<span className="flex-1 text-sm text-blue-600/80">
							{evaluation.date_rendu_reelle
								? new Date(evaluation.date_rendu_reelle).toLocaleDateString("fr-fr", dateOptions)
								: `À rendre le ${new Date(evaluation.date_rendu).toLocaleDateString("fr-fr", dateOptions)}`}
						</span>
						{evaluation.date_rendu_reelle && !evaluation.approved ? (
							<Button
								onClick={() => setFormIsOpen(true)}
								variant="outline"
								className="text-sm h-[32px] aspect-square">
								<FontAwesomeIcon icon={faEdit} />
							</Button>
						) : (
							<></>
						)}
					</div>
				</div>
			</li>
			<EvaluationForm
				open={formIsOpen}
				onOpenChange={setFormIsOpen}
				evaluation={evaluation}
				elementName={elementName}
				expoName={expoName}
				onSubmit={onChange}
			/>
		</>
	) : (
		// skeleton while waiting for data
		<li className="w-full">
			<Skeleton className="w-full h-[128px] rounded-[8px] flex flex-col gap-[16px] p-[16px]">
				<Skeleton className="w-full h-[16px] rounded-[8px]" />
				<Skeleton className="w-[80%] h-[16px] rounded-[8px] opacity-60" />
				<div className="w-full flex justify-end">
					<Skeleton className="h-[32px] aspect-square rounded-full " />
				</div>
			</Skeleton>
		</li>
	)
}

export default EvaluationCard
