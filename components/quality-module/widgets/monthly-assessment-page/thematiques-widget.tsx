import SectionContainer from "@components/layout/quality/section-container"
import { ScrollArea } from "@components/radix/scroll-area"
import { MoisCycle, Thematique } from "@conf/api/data-types/quality-module"
import { MySession } from "@conf/utility-types"
import useAPIRequest from "@hook/useAPIRequest"
import { useSession } from "next-auth/react"
import { Fragment, useEffect, useState } from "react"

interface Props {
	moisCycle: MoisCycle
}

const ThematiquesWidget = ({ moisCycle }: Props) => {
	// state

	const [thematiques, setThematiques] = useState<Thematique[]>([])

	// get the evaluations when the moisCycle changes

	const session = useSession().data as MySession | null
	const makeAPIRequest = useAPIRequest()

	useEffect(() => {
		if (!session) return

		// get the Thematique objects from the API
		// which have not been evaluated during this month

		const thematiqueIds = [...moisCycle.evaluations.map((evaluation) => evaluation.thematique_id)]

		makeAPIRequest<Thematique[], void>(session, "get", "thematiques", undefined, undefined, (res) => {
			setThematiques(res.data.filter((thematique) => !thematiqueIds.includes(thematique.id)))
		})
	}, [moisCycle, session])

	// utils

	const getLatestEvaluationDate = (thematiqueId: number) => {
		const thematiqueEvaluations = moisCycle.evaluations.filter((evaluation) => evaluation.thematique_id === thematiqueId)
		if (thematiqueEvaluations.length === 0) return null
		const latestEvaluation = thematiqueEvaluations.reduce((prev, curr) => {
			const prevDate = prev.date_rendu_reelle ? new Date(prev.date_rendu_reelle) : new Date(prev.date_rendu)
			const currDate = curr.date_rendu_reelle ? new Date(curr.date_rendu_reelle) : new Date(curr.date_rendu)
			return prevDate > currDate ? prev : curr
		})
		return latestEvaluation.date_rendu_reelle ? new Date(latestEvaluation.date_rendu_reelle) : new Date(latestEvaluation.date_rendu)
	}

	// true if the next evaluation date is today or in the past

	const shouldEvaluate = (thematique: Thematique) => {
		const latestEvalDate = getLatestEvaluationDate(thematique.id)
		if (!latestEvalDate) return true
		const nextEvalDate = new Date(latestEvalDate)
		nextEvalDate.setMonth(nextEvalDate.getMonth() + thematique.periodicite)
		return new Date() >= nextEvalDate
	}

	// render

	return (
		<SectionContainer>
			<div className="flex flex-col">
				<h3 className="text-xl font-semibold text-blue-600">Prochaines thématiques</h3>
				<p className="text-base font-normal text-blue-600/60">Thématiques non évaluées durant ce mois</p>
			</div>
			<ul className="w-full flex flex-col gap-4 md:mt-8 h-full flex-grow-0">
				<li className="w-full flex flex-row items-center max-md:hidden">
					<span className="text-base text-blue-600/60 font-normal flex-1">Thématiques</span>
					<span className="text-base text-blue-600/60 font-normal flex-1">Dernière évaluation</span>
					<span className="text-base text-blue-600/60 font-normal flex-1">Périodicité</span>
					<span className="w-[40px] h-[40px]"></span>
				</li>
				<div className="w-full h-[1px] bg-blue-600/10"></div>

				<ScrollArea className="flex h-[280px] flex-col gap-4">
					{thematiques.length > 0 ? (
						thematiques.map((thematique, index) => (
							<Fragment key={thematique.id}>
								<li className="w-full flex flex-row items-center gap-4 py-[16px]">
									<div
										className="w-full flex flex-row items-center flex-1
                                            max-md:flex-col max-md:items-start">
										<div
											className="flex flex-row flex-wrap gap-4 flex-1 items-center
                                            max-md:flex-col max-md:items-start">
											{shouldEvaluate(thematique) ? (
												<span
													className="text-sm font-normal text-warning px-[8px] py-[4px]
                                                        border border-warning/20 rounded-lg bg-warning/10">
													À évaluer
												</span>
											) : (
												<></>
											)}
											<span className="text-base font-normal text-blue-600">{thematique.nom}</span>
										</div>
										{getLatestEvaluationDate(thematique.id) ? (
											<span className="text-base max-md:text-sm font-normal text-blue-600/80 flex-1 capitalize">
												{getLatestEvaluationDate(thematique.id)?.toLocaleDateString("fr-fr", {
													year: "numeric",
													month: "long",
													day: "numeric"
												})}
											</span>
										) : (
											<span className="text-base max-md:text-sm font-normal text-blue-600/80 flex-1">Pas d&apos;évaluation</span>
										)}
										<span className="text-base max-md:text-sm font-normal text-blue-600/80 flex-1">
											À évaluer
											{thematique.periodicite > 1 ? ` tous les ${thematique.periodicite} mois` : " tous les mois"}
										</span>
									</div>
								</li>
								{index < thematiques.length - 1 ? <div className="w-full h-[1px] bg-blue-600/10"></div> : <></>}
							</Fragment>
						))
					) : (
						<p className="text-base font-normal text-blue-600/60">Aucune thématique à évaluer</p>
					)}
				</ScrollArea>
			</ul>
		</SectionContainer>
	)
}

export default ThematiquesWidget
