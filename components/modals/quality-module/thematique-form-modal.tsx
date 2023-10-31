import Button from "@components/button"
import ModalContainer from "../modal-container"
import { faEdit, faFloppyDisk, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import { Fragment, useEffect, useState } from "react"
import FieldContainer from "@components/form-elements/field-container"
import Label from "@components/form-elements/label"
import TextInput from "@components/form-elements/text-input"
import NumericField from "@components/form-elements/numeric-field"
import { QuestionCreate, Thematique } from "@conf/api/data-types/quality-module"
import QuestionFormModal from "./question-form-modal"
import useAPIRequest from "@hook/useAPIRequest"
import { MySession } from "@conf/utility-types"
import { useSession } from "next-auth/react"
import { Switch } from "@components/radix/switch"

interface Props {
	thematique?: Thematique
	isOpen: boolean
	domaineId: number
	onClose: () => void
	onSubmit: () => void
}

const ThematiqueFormModal = ({ thematique, isOpen, domaineId, onClose, onSubmit }: Props) => {
	// form state

	const [nom, setNom] = useState<string>("")
	const [description, setDescription] = useState<string>("")
	const [questionGrille, setQuestionGrille] = useState<string>("")
	const [grilleDeNotes, setGrilleDeNotes] = useState<boolean>(true)
	const [periodicite, setPeriodicite] = useState<number>(1)
	const [ponderateur, setPonderateur] = useState<number>(10)
	const [question, setQuestion] = useState<string>("")
	const [questionPonderateur, setQuestionPonderateur] = useState<number>(10)

	const [questions, setQuestions] = useState<QuestionCreate[]>([])

	const [errorFields, setErrorFields] = useState<string[]>([])

	useEffect(() => {
		console.log("inclure la grille de note", grilleDeNotes)
	}, [grilleDeNotes])

	// keep form state in sync with props

	useEffect(() => {
		if (!thematique) return

		setNom(thematique.nom)
		setDescription(thematique.description)
		setQuestionGrille(thematique.question_grille)
		setGrilleDeNotes(thematique.grille_de_notes)
		setPeriodicite(thematique.periodicite)
		setPonderateur(thematique.ponderateur)
		setQuestion(thematique.question)
		setQuestionPonderateur(thematique.question_ponderateur)
		setQuestions(thematique.questions)
	}, [thematique, isOpen])

	// manage modals & forms

	const [questionModalIsOpen, setQuestionModalIsOpen] = useState<boolean>(false)
	const [questionEditModalIsOpen, setQuestionEditModalIsOpen] = useState<boolean>(false)

	const [selectedQuestionId, setSelectedQuestionId] = useState<number>(0)

	// utils

	const clearFormFields = () => {
		setNom("")
		setDescription("")
		setQuestionGrille("")
		setGrilleDeNotes(true)
		setPeriodicite(1)
		setPonderateur(10)
		setQuestion("")
		setQuestionPonderateur(10)
		setQuestions([])
	}

	// handlers

	const handleClose = () => {
		clearFormFields()
		onClose()
	}

	// make a request to create a new thematique

	const makeAPIRequest = useAPIRequest()
	const session = useSession().data as MySession | null

	const handleSubmit = () => {
		if (!session) return

		if (!nom || !question) {
			setErrorFields(() => {
				const newErrorFields = []
				if (!nom) newErrorFields.push("nom")
				if (!question) newErrorFields.push("question")
				if (!description) newErrorFields.push("description")
				return newErrorFields
			})
			return
		}

		// if the thematique was passed as a prop, we're editing it
		// so we need to make a PUT request instead of a POST request

		if (thematique) {
			// keep only the fields that have been modified

			const data = {
				...(nom !== thematique.nom ? { new_nom: nom } : {}),
				...(description !== thematique.description ? { description } : {}),
				...(questionGrille !== thematique.question_grille ? { question_grille: questionGrille } : {}),
				...(grilleDeNotes !== thematique.grille_de_notes ? { grille_de_notes: grilleDeNotes } : {}),
				...(periodicite !== thematique.periodicite ? { periodicite } : {}),
				...(ponderateur !== thematique.ponderateur ? { ponderateur } : {}),
				...(question !== thematique.question ? { question } : {}),
				...(questionPonderateur !== thematique.question_ponderateur ? { question_ponderateur: questionPonderateur } : {})
			}

			makeAPIRequest<Thematique, void>(session, "put", "thematiques", thematique.nom, data, () => {})

			// in case the list of questions has been modified
			// update those that have been modified, create those that have been added
			// and delete those that have been removed

			// the new ones are the ones which id is not in the list of the old ones
			const newQuestions = questions.filter((question) => !thematique.questions.map((q) => q.id).includes(question.id))
			const modifiedQuestions = questions.filter((question) => question.id && thematique.questions.map((q) => q.id).includes(question.id))
			const deletedQuestions = thematique.questions.filter((question) => !questions.map((q) => q.id).includes(question.id))

			// delete questions

			for (const question of deletedQuestions) {
				makeAPIRequest(session, "delete", "questions_thematiques", `id/${question.id}`, undefined, () => {})
			}

			// create questions

			for (const question of newQuestions) {
				makeAPIRequest<QuestionCreate, void>(
					session,
					"post",
					"questions_thematiques",
					undefined,
					{
						thematique_id: thematique.id,
						titre: question.titre,
						question: question.question,
						description: question.description,
						grille: question.grille,
						optional: question.optional
					},
					() => {}
				)
			}

			// update questions

			if (modifiedQuestions.length == 0) {
				onSubmit()
				handleClose()
			}

			for (const question of modifiedQuestions) {
				let oldQuestion = thematique.questions.find((q) => q.id === question.id)

				let updateData = {
					...(oldQuestion?.titre !== question.titre ? { titre: question.titre } : {}),
					...(oldQuestion?.question !== question.question ? { question: question.question } : {}),
					...(oldQuestion?.description !== question.description ? { description: question.description } : {}),
					...(oldQuestion?.grille !== question.grille ? { grille: question.grille } : {}),
					...(oldQuestion?.optional !== question.optional ? { optional: question.optional } : {})
				}

				makeAPIRequest<QuestionCreate, void>(session, "put", "questions_thematiques", `id/${question.id}`, updateData, () => {
					if (question === modifiedQuestions[modifiedQuestions.length - 1]) {
						onSubmit()
						handleClose()
					}
				})
			}

			return
		}

		makeAPIRequest<Thematique, void>(
			session,
			"post",
			"thematiques",
			undefined,
			{
				domaine_id: domaineId,
				nom,
				description,
				question_grille: questionGrille,
				grille_de_notes: grilleDeNotes,
				periodicite,
				ponderateur,
				question,
				question_ponderateur: questionPonderateur
			},
			(res) => {
				if (questions.length == 0) {
					onSubmit()
					handleClose()
				}
				// now post each question
				const thematique = res.data

				questions.forEach((question, index) => {
					makeAPIRequest<QuestionCreate, void>(
						session,
						"post",
						"questions_thematiques",
						undefined,
						{
							thematique_id: thematique.id,
							titre: question.titre,
							question: question.question,
							description: question.description,
							grille: question.grille,
							optional: question.optional
						},
						() => {
							if (index === questions.length - 1) {
								onSubmit()
								handleClose()
							}
						}
					)
				})
			}
		)
	}

	// render

	return (
		<>
			<ModalContainer isVisible={isOpen}>
				<form
					className="flex flex-col gap-8 min-w-[500px] overflow-auto bg-white rounded-2xl p-[32px]"
					name="thematique-form">
					<h3 className="text-xl font-bold text-blue-600 flex-1">{thematique ? "Modifier une thématique" : "Nouvelle thématique"}</h3>
					<div className="w-full h-[1px] bg-blue-600/10"></div>
					<FieldContainer fullWidth>
						<Label>Nom</Label>
						<TextInput
							fullWidth
							placeholder="Hygiène, Propreté, ..."
							currentValue={nom}
							isInErrorState={errorFields.includes("nom")}
							onChange={(n) => setNom(n)}
						/>
					</FieldContainer>
					<FieldContainer fullWidth>
						<Label>Description</Label>
						<TextInput
							isTextArea
							fullWidth
							placeholder="Description de la thématique d'évaluation..."
							currentValue={description}
							onChange={(d) => setDescription(d)}
						/>
					</FieldContainer>
					<FieldContainer fullWidth>
						<Label>Question pour la grille de note</Label>
						<TextInput
							isTextArea
							fullWidth
							placeholder="Question pour la grille de note..."
							currentValue={questionGrille}
							onChange={(d) => setQuestionGrille(d)}
						/>
					</FieldContainer>
					<FieldContainer fullWidth>
						<Label>Inclure la grille de notes ?</Label>
						<Switch
							checked={grilleDeNotes}
							onCheckedChange={(checked) => setGrilleDeNotes(checked)}
						/>
					</FieldContainer>
					<div className="w-full flex flex-row gap-4">
						<FieldContainer fullWidth>
							<Label>Périodicité en mois</Label>
							<NumericField
								fullWidth
								min={1}
								max={12}
								value={periodicite}
								onChange={(p) => setPeriodicite(p)}
							/>
						</FieldContainer>
						<FieldContainer fullWidth>
							<Label>Pondérateur</Label>
							<NumericField
								fullWidth
								min={1}
								value={ponderateur}
								onChange={(p) => setPonderateur(p)}
							/>
						</FieldContainer>
					</div>
					<FieldContainer fullWidth>
						<Label>Question générale</Label>
						<TextInput
							isTextArea
							fullWidth
							placeholder="Question générale de la thématique d'évaluation..."
							currentValue={question}
							onChange={(q) => setQuestion(q)}
							isInErrorState={errorFields.includes("question")}
						/>
					</FieldContainer>
					<FieldContainer fullWidth>
						<Label>Pondérateur de la question générale</Label>
						<NumericField
							fullWidth
							min={1}
							value={questionPonderateur}
							onChange={(p) => setQuestionPonderateur(p)}
						/>
					</FieldContainer>
					<div className="w-full flex flex-col gap-4">
						<div className="flex flex-row justify-between items-center w-full gap-8">
							<Label>Questions spécifiques</Label>
							<Button
								icon={faPlus}
								role="secondary"
								onClick={() => setQuestionModalIsOpen(true)}>
								Ajouter une question
							</Button>
						</div>
						<div className="w-full h-[1px] bg-blue-600/10"></div>
						{questions.length > 0 ? (
							<ul className="flex flex-col gap-4 max-w-3xl">
								{questions.map((question, index) => (
									<Fragment key={question.id}>
										<li className="w-full flex flex-row items-center gap-4">
											<div className="flex flex-col gap-2 flex-1">
												<div className="flex flex-row flex-wrap gap-2">
													{question.titre ? <p className="text-base font-normal text-blue-600/60">{question.titre}</p> : <></>}
													{question.optional || question.grille ? (
														<span className="text-sm font-semibold text-blue-600/60">
															({question.optional ? "optionnelle" : ""}
															{question.optional && question.grille ? ", " : ""}
															{question.grille ? "grille" : ""})
														</span>
													) : (
														<></>
													)}
												</div>
												<span className="w-full text-sm font-normal text-blue-600/80">{question.description}</span>
												<p className="w-full text-base font-normal text-blue-600 whitespace-wrap">{question.question}</p>
											</div>
											<Button
												hasBorders
												icon={faEdit}
												role="tertiary"
												onClick={() => {
													setSelectedQuestionId(index)
													setQuestionEditModalIsOpen(true)
												}}>
												{" "}
											</Button>
											<Button
												hasBorders
												icon={faTrash}
												role="tertiary"
												status="danger"
												onClick={() => setQuestions(questions.filter((_, i) => i !== index))}>
												{" "}
											</Button>
										</li>
										<div className="w-full h-[1px] bg-blue-600/10"></div>
									</Fragment>
								))}
							</ul>
						) : (
							<p className="text-sm text-blue-600/60">Aucune question spécifique</p>
						)}
					</div>
					<div className="flex flex-row gap-4 w-full">
						<Button
							fullWidth
							role="secondary"
							onClick={handleClose}>
							Annuler
						</Button>
						<Button
							fullWidth
							icon={faFloppyDisk}
							active={nom && question ? true : false}
							onClick={handleSubmit}>
							Sauver
						</Button>
					</div>
				</form>
			</ModalContainer>
			<QuestionFormModal
				isOpen={questionModalIsOpen}
				onClose={() => setQuestionModalIsOpen(false)}
				onSubmit={(q) => setQuestions([...questions, q])}
			/>
			<QuestionFormModal
				question={questions[selectedQuestionId]}
				isOpen={questionEditModalIsOpen}
				onClose={() => setQuestionEditModalIsOpen(false)}
				onSubmit={(q) => {
					const newQuestions = [...questions]
					newQuestions[selectedQuestionId] = q
					setQuestions(newQuestions)
				}}
			/>
		</>
	)
}

export default ThematiqueFormModal
