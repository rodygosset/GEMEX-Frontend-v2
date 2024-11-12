import Button from "@components/button"
import DeleteDialog from "@components/modals/delete-dialog"
import ContextMenu from "@components/radix/context-menu"
import { Domaine, Evaluation, Thematique } from "@conf/api/data-types/quality-module"
import { MySession } from "@conf/utility-types"
import { faEdit, faEye, faInfoCircle, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import useAPIRequest from "@hook/useAPIRequest"
import { useSession } from "next-auth/react"
import { Fragment, useEffect, useState } from "react"

interface Props {
	domaine: Domaine
	onEdit: () => void
	onDelete: () => void
	onNewThematique: () => void
	onEditThematique: (thematique: Thematique) => void
	onDeleteThematique: (thematique: Thematique) => void
	onOpenThematique: (thematique: Thematique) => void
}

interface ThematiqueEvaluationDate {
	thematiqueId: number
	date: Date | null
}

const DomaineCard = ({ domaine, onEdit, onDelete, onNewThematique, onEditThematique, onDeleteThematique, onOpenThematique }: Props) => {
	// utils

	const makeAPIRequest = useAPIRequest()
	const session = useSession().data as MySession | null

	const getLatestEvaluationDate = async (thematiqueId: number) => {
		if (!session) return null

		// make a request to the API to get the latest evaluation for a given thematique
		return await makeAPIRequest<Evaluation[], Date | null>(
			session,
			"post",
			"evaluations",
			"search/",
			{
				thematiques: [thematiqueId]
			},
			// keep the latest one (sort by date_rendu_reelle descending)
			(res) => {
				const sortedEvaluations = res.data.sort((a, b) => new Date(b.date_rendu).getTime() - new Date(a.date_rendu).getTime())
				return sortedEvaluations.length > 0 ? new Date(sortedEvaluations[0].date_rendu) : null
			},
			(err) => {
				console.log(err)
				return null
			}
		)
	}

	// state

	const [thematiquesEvaluationDates, setThematiquesEvaluationDates] = useState<ThematiqueEvaluationDate[]>(
		domaine.thematiques.map((thematique) => ({
			thematiqueId: thematique.id,
			date: null
		}))
	)

	useEffect(() => {
		// get the latest evaluation date for each thematique
		domaine.thematiques.forEach(async (thematique) => {
			const date = await getLatestEvaluationDate(thematique.id)
			if (!date || date instanceof Error) return
			setThematiquesEvaluationDates((prev) => prev.map((prev) => (prev.thematiqueId === thematique.id ? { ...prev, date } : prev)))
		})
	}, [domaine])

	// utils

	const shouldEvaluate = (thematique: Thematique) => {
		const latestEvalDate = thematiquesEvaluationDates.find((d) => d.thematiqueId === thematique.id)?.date
		if (!latestEvalDate) return true
		const nextEvalDate = new Date(latestEvalDate)
		nextEvalDate.setMonth(nextEvalDate.getMonth() + thematique.periodicite)
		return new Date() >= nextEvalDate
	}

	// manage modals

	const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState<boolean>(false)

	// render

	return (
		<>
			<li className="w-full flex flex-col gap-8 bg-white/10 shadow-2xl shadow-primary/20 p-[32px] rounded-2xl">
				<div className="flex flex-row gap-4 w-full">
					<div className="flex flex-col flex-1">
						<h3 className="text-xl font-bold text-purple-600">{domaine.nom}</h3>
						<p className="text-base font-normal text-blue-600/60">{domaine.description}</p>
					</div>
					<div className="flex flex-row flex-wrap gap-4 max-lg:hidden">
						<Button
							hasBorders
							icon={faEdit}
							role="tertiary"
							onClick={onEdit}>
							Modifier
						</Button>
						<Button
							icon={faPlus}
							role="secondary"
							onClick={onNewThematique}>
							Nouvelle thématique
						</Button>
						<Button
							hasBorders
							icon={faTrash}
							role="tertiary"
							status="danger"
							onClick={() => setDeleteDialogIsOpen(true)}>
							Supprimer
						</Button>
					</div>
					<ContextMenu
						className="lg:hidden"
						options={[
							{
								label: "Nouvelle thématique",
								value: "new",
								icon: faPlus
							},
							{
								label: "Modifier",
								value: "edit",
								icon: faEdit
							},
							{
								label: "Supprimer",
								value: "delete",
								icon: faTrash,
								status: "danger"
							}
						]}
						onSelect={(option) => {
							if (option === "edit") {
								onEdit()
							} else if (option === "new") {
								onNewThematique()
							} else if (option === "delete") {
								setDeleteDialogIsOpen(true)
							}
						}}
					/>
				</div>
				<ul className="w-full flex flex-col gap-4 sm:mt-8">
					<li className="w-full flex flex-row items-center max-sm:hidden">
						<span className="text-base text-blue-600/60 font-normal flex-1">Thématiques</span>
						<span className="text-base text-blue-600/60 font-normal flex-1">Dernière évaluation</span>
						<span className="text-base text-blue-600/60 font-normal flex-1">Périodicité</span>
						<span className="w-[40px] h-[40px]"></span>
					</li>
					<div className="w-full h-[1px] bg-blue-600/10"></div>
					{domaine.thematiques.length > 0 ? (
						domaine.thematiques.map((thematique, index) => (
							<Fragment key={thematique.id}>
								<li className="w-full flex flex-row items-center gap-4 py-4">
									<div
										className="w-full flex flex-row items-center flex-1
                                                max-sm:flex-col max-sm:items-start">
										<div
											className="flex flex-row flex-wrap gap-4 flex-1 items-center
                                                max-sm:flex-col max-sm:items-start">
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
										{thematiquesEvaluationDates.find((d) => d.thematiqueId === thematique.id)?.date ? (
											<span className="text-base max-md:text-sm font-normal text-blue-600/80 flex-1 capitalize">
												{thematiquesEvaluationDates
													.find((d) => d.thematiqueId === thematique.id)
													?.date?.toLocaleDateString("fr-fr", { year: "numeric", month: "long", day: "numeric" })}
											</span>
										) : (
											<span className="text-base max-md:text-sm font-normal text-blue-600/80 flex-1">Pas d&apos;évaluation</span>
										)}
										<span className="text-base max-md:text-sm font-normal text-blue-600/80 flex-1">
											À évaluer
											{thematique.periodicite > 1 ? ` tous les ${thematique.periodicite} mois` : " tous les mois"}
										</span>
									</div>
									<ContextMenu
										options={[
											{
												label: "Informations",
												value: "infos",
												icon: faInfoCircle
											},
											{
												label: "Modifier",
												value: "edit",
												icon: faEdit
											},
											{
												label: "Supprimer",
												value: "delete",
												icon: faTrash,
												status: "danger"
											}
										]}
										onSelect={(option) => {
											if (option === "infos") {
												onOpenThematique(thematique)
											} else if (option === "edit") {
												onEditThematique(thematique)
											} else if (option === "delete") {
												onDeleteThematique(thematique)
											}
										}}
									/>
								</li>
								{index < domaine.thematiques.length - 1 ? <div className="w-full h-[1px] bg-blue-600/10"></div> : <></>}
							</Fragment>
						))
					) : (
						<p className="text-base font-normal text-blue-600/60">Aucune thématique</p>
					)}
				</ul>
			</li>
			<DeleteDialog
				open={deleteDialogIsOpen}
				onOpenChange={setDeleteDialogIsOpen}
				itemType="domaines"
				itemTitle={domaine.nom}
				onSuccess={onDelete}
				goBackOnSuccess={false}
			/>
		</>
	)
}

export default DomaineCard
