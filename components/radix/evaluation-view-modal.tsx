import { Evaluation, Thematique } from "@conf/api/data-types/quality-module"
import { Dialog, DialogContent } from "./dialog"
import { cn } from "@utils/tailwind"
import Image from "next/image"
import { Fragment, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { MySession } from "@conf/utility-types"
import useAPIRequest from "@hook/useAPIRequest"
import { User } from "@conf/api/data-types/user"
import BarChart from "@components/charts/bar-chart-modern"
import { GradeRadioGroup } from "./evaluation-form-elements/grade-radio-group"

interface Props {
	evaluation?: Evaluation
	elementName: string
	expoName: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

const EvaluationViewModal = ({ evaluation, elementName, expoName, open, onOpenChange }: Props) => {
	const [thematique, setThematique] = useState<Thematique>()
	const [user, setUser] = useState<User>()

	// get the thematique from the API

	const session = useSession().data as MySession | null
	const makeAPIRequest = useAPIRequest()

	const getThematique = () => {
		if (!session || !evaluation) return

		makeAPIRequest<Thematique, void>(session, "get", "thematiques", `id/${evaluation.thematique_id}`, undefined, (res) => setThematique(res.data))
	}

	const getUser = () => {
		if (!session || !evaluation) return

		makeAPIRequest<User, void>(session, "get", "users", `id/${evaluation.user_id}`, undefined, (res) => setUser(res.data))
	}

	useEffect(() => {
		if (!session) return
		getThematique()
		getUser()
	}, [session, evaluation])

	// utils

	const getDate = () => {
		if (!evaluation) return ""

		const date = new Date(evaluation.date_rendu_reelle ?? evaluation.date_rendu)
		return date.toLocaleDateString("fr-fr", {
			year: "numeric",
			month: "long",
			day: "numeric"
		})
	}

	const numberToLetter = (number?: number) => {
		if (!number) return ""
		if (number == 20) return "a"
		else if (number >= 15) return "b"
		else if (number >= 10) return "c"
		else if (number >= 5) return "d"
		else if (number >= 0) return "e"
		else return ""
	}

	// render

	return user && thematique && evaluation ? (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"w-full md:max-w-[760px] max-h-[90vh] min-h-[576px] md:h-fit max-md:h-full bg-neutral-50 p-[32px]",
					"max-md:top-auto max-md:bottom-0 max-md:translate-y-0 max-md:max-w-full",
					"flex flex-col gap-[32px] overflow-scroll"
				)}>
				<div className="w-full flex flex-wrap gap-[32px] items-start">
					<div className="relative w-[100px] sm:w-[165px] aspect-[1.375]">
						<Image
							quality={100}
							src={"/images/quality-assessment-illustration.svg"}
							alt={"Évaluation de la qualité"}
							priority
							fill
							style={{
								objectFit: "contain",
								top: "auto"
							}}
						/>
					</div>
					<div className="flex flex-col flex-1">
						<span className="text-base font-bold text-blue-600">{elementName}</span>
						<span className="text-sm font-medium text-blue-600/60">{expoName}</span>
						<span className="text-xs font-medium text-fuchsia-600 bg-fuchsia-600/10 px-4 py-[8px] rounded-[8px] w-fit mt-4">{thematique.nom}</span>
					</div>
				</div>
				<div className="w-full flex items-center gap-4">
					<div className="flex-1 flex flex-col gap-[8px]">
						<span className="text-xl font-bold text-blue-600">Résultat</span>
						<div className="flex flex-col w-full gap-[4px]">
							<span className="text-sm font-normal text-blue-600/60 capitalize">
								{user.prenom} {user.nom}
							</span>
							<span className="text-sm font-normal text-blue-600/60">{getDate()}</span>
						</div>
					</div>
					<div className="flex items-center gap-[4px]">
						<span
							className={`text-3xl font-semibold ${(evaluation.note || 0) >= 16 ? "text-success" : ""} ${
								(evaluation.note || 0) >= 15 && (evaluation.note || 0) < 16 ? "text-warning" : ""
							} ${(evaluation.note || 0) < 15 ? "text-error" : ""}`}>
							{evaluation.note?.toFixed(2) ?? 0}
						</span>
						<span className="text-sm font-semibold text-blue-600/60">/20</span>
					</div>
				</div>
				<div className="w-full h-[1px] bg-blue-600/20">&nbsp;</div>
				{thematique.grille_de_notes ? (
					<>
						<div className="w-full flex flex-col gap-4">
							<div className="flex flex-col">
								<span className="text-xl font-bold text-blue-600">Grille de notes</span>
								<span className="text-sm font-normal text-blue-600/60">
									Nombre de notes allant de A, très bien, à E, très mauvais, laissées dans la grille de note.
								</span>
							</div>
							<div className="w-full flex flex-col items-center justify-center min-h-[200px] h-full">
								<BarChart
									data={["a", "b", "c", "d", "e"].map((letter) => ({
										name: letter.toUpperCase(),
										// @ts-ignore
										value: evaluation[`note_${letter}`] ?? 0
									}))}
								/>
							</div>
						</div>
						<div className="w-full h-[1px] bg-blue-600/20">&nbsp;</div>
					</>
				) : (
					<></>
				)}
				<div className="w-full flex flex-col gap-4">
					<div className="flex flex-col">
						<span className="text-xl font-bold text-blue-600">Questions</span>
						<span className="text-sm font-normal text-blue-600/60">
							Réponses aux questions spécifiques à la thématique <span className="text-blue-600 font-semibold">&quot;{thematique.nom}&quot;</span>
						</span>
					</div>
					<ul className="w-full flex flex-col gap-[32px]">
						{thematique.questions.map((question) => (
							<Fragment key={question.id}>
								<li className="w-full flex flex-col gap-4">
									<div className="w-full flex flex-col gap-[4px]">
										<span className="text-xl font-bold text-blue-600">{question.titre ?? "Question"}</span>
										{question.description ? <span className="text-sm font-normal text-blue-600/60">{question.description}</span> : <></>}
										<span className="text-base font-semibold text-blue-600">{question.question}</span>
									</div>
									<GradeRadioGroup
										selected={numberToLetter(evaluation.reponses.find((reponse) => reponse.question_id === question.id)?.note ?? 0)}
									/>
								</li>
								<div className="w-full h-[1px] bg-blue-600/20">&nbsp;</div>
							</Fragment>
						))}
					</ul>
				</div>
				<div className="w-full flex flex-col gap-4">
					<div className="flex flex-col">
						<span className="text-xl font-bold text-blue-600">Question générale</span>
						<span className="text-sm font-normal text-blue-600/60">Réponse de l&apos;évaluateur à la question d&apos;opinion générale</span>
					</div>
					<span className="text-xl font-bold text-blue-600">{thematique.question ?? "Question"}</span>
					<GradeRadioGroup selected={numberToLetter(evaluation.question_note ?? 0)} />
				</div>
				<div className="w-full h-[1px] bg-blue-600/20">&nbsp;</div>
				<div className="w-full flex flex-col gap-4">
					<div className="flex flex-col">
						<span className="text-xl font-bold text-blue-600">Commentaires</span>
						<span className="text-sm font-normal text-blue-600/60">Remarques et commentaires laissés par l&apos;évaluateur</span>
					</div>
					<pre className="text-base font-normal text-blue-600/80 font-sans p-4 border border-blue-600/20 rounded-[8px]">{evaluation.commentaire}</pre>
				</div>
			</DialogContent>
		</Dialog>
	) : (
		<></>
	)
}

export default EvaluationViewModal
