import { Evaluation, Thematique } from "@conf/api/data-types/quality-module"
import { useEffect, useState } from "react"
import { cn } from "@utils/tailwind"
import { Dialog, DialogContent } from "./dialog"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { MySession } from "@conf/utility-types"
import useAPIRequest from "@hook/useAPIRequest"
import { Button } from "./button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faArrowRight, faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { Alert, AlertDescription, AlertTitle } from "./alert"
import GradeCountInput from "./evaluation-form-elements/grade-count-input"
import { z } from "zod"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "./form"
import { GradeRadioGroup } from "./evaluation-form-elements/grade-radio-group"
import { Textarea } from "./textarea"

interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
	evaluation?: Evaluation
	elementName: string
	expoName: string
	onSubmit: (evaluation: Evaluation) => void
}

// form schema

const evaluationFormSchema = z.object({
	note_a: z.number().min(0).max(100),
	note_b: z.number().min(0).max(100),
	note_c: z.number().min(0).max(100),
	note_d: z.number().min(0).max(100),
	note_e: z.number().min(0).max(100),
	question_note: z.number().min(4).max(20),
	reponses: z.array(
		z.object({
			question_id: z.number().min(1),
			note: z.number().min(4).max(20).optional(),
			note_a: z.number().min(0).max(100).optional(),
			note_b: z.number().min(0).max(100).optional(),
			note_c: z.number().min(0).max(100).optional(),
			note_d: z.number().min(0).max(100).optional(),
			note_e: z.number().min(0).max(100).optional()
		})
	),
	commentaire: z.string().max(1000)
})

const EvaluationForm = ({ open, onOpenChange, evaluation, elementName, expoName, onSubmit }: Props) => {
	const [currentTab, setCurrentTab] = useState("intro")
	const [thematique, setThematique] = useState<Thematique>()

	// get the thematique from the API

	const session = useSession().data as MySession | null
	const makeAPIRequest = useAPIRequest()

	const getThematique = () => {
		if (!session || !evaluation) return

		makeAPIRequest<Thematique, void>(session, "get", "thematiques", `id/${evaluation.thematique_id}`, undefined, (res) => setThematique(res.data))
	}

	useEffect(() => {
		if (!session) return
		getThematique()
	}, [session, evaluation])

	// handle navigation

	const goBack = () => {
		if (currentTab == "intro") onClose()
		// if the current tab is the mainQuestion tab, go back to the last question
		else if (currentTab == "mainQuestion") {
			const lastQuestion = thematique?.questions.length ? thematique.questions[thematique.questions.length - 1] : undefined
			setCurrentTab(lastQuestion?.id.toString() ?? "intro")
		} else if (currentTab == "comments") setCurrentTab("mainQuestion") // if the current tab is the comments tab, go back to the main question
		else {
			// if the current tab is the first question, go back to the intro
			const firstQuestion = thematique?.questions.length ? thematique.questions[0] : undefined
			if (currentTab == firstQuestion?.id.toString()) setCurrentTab("intro")
			// otherwise go back to the previous question
			else {
				const index = thematique?.questions.findIndex((question) => question.id.toString() == currentTab)
				if (index && thematique && index > 0) setCurrentTab(thematique.questions[index - 1].id.toString())
				else setCurrentTab("intro")
			}
		}
	}

	const goForward = () => {
		if (currentTab == "intro") {
			const firstQuestion = thematique?.questions.length ? thematique.questions[0] : undefined
			setCurrentTab(firstQuestion?.id.toString() ?? "comments")
		} else if (currentTab == "mainQuestion") setCurrentTab("comments")
		else if (currentTab == "comments") onSubmitHandler()
		// otherwise go to the next question
		else {
			const index = thematique?.questions.findIndex((question) => question.id.toString() == currentTab) ?? -1
			console.log("current question", thematique?.questions[index])
			console.log("current question index", index)
			if (index > -1 && thematique && index < thematique.questions.length - 1) setCurrentTab(thematique.questions[index + 1].id.toString())
			else setCurrentTab("mainQuestion")
		}
	}

	// form state

	const form = useForm<z.infer<typeof evaluationFormSchema>>({
		resolver: zodResolver(evaluationFormSchema),
		defaultValues: {
			note_a: evaluation?.note_a ?? 0,
			note_b: evaluation?.note_b ?? 0,
			note_c: evaluation?.note_c ?? 0,
			note_d: evaluation?.note_d ?? 0,
			note_e: evaluation?.note_e ?? 0,
			question_note: evaluation?.question_note ?? 0,
			reponses: evaluation?.reponses,
			commentaire: evaluation?.commentaire
		}
	})

	// update form state when evaluation changes

	useEffect(() => {
		form.reset({
			note_a: evaluation?.note_a ?? 0,
			note_b: evaluation?.note_b ?? 0,
			note_c: evaluation?.note_c ?? 0,
			note_d: evaluation?.note_d ?? 0,
			note_e: evaluation?.note_e ?? 0,
			question_note: evaluation?.question_note ?? 0,
			reponses: evaluation?.reponses,
			commentaire: evaluation?.commentaire
		})
	}, [evaluation])

	const formData = useWatch({ control: form.control })

	// util

	const numberToLetter = (number?: number) => {
		if (typeof number != "number") return ""
		if (number == 20) return "a"
		else if (number >= 15) return "b"
		else if (number >= 10) return "c"
		else if (number >= 5) return "d"
		else if (number >= 0) return "e"
		else return ""
	}

	const letterToNumber: Record<string, number> = {
		a: 20,
		b: 15,
		c: 10,
		d: 5,
		e: 0
	}

	const allowContinue = () => {
		if (currentTab == "intro" && thematique?.grille_de_notes) {
			// make sure at least one grade is not 0 in note_a, note_b, note_c, note_d, note_e
			return (
				(formData.note_a && formData.note_a > 0) ||
				(formData.note_b && formData.note_b > 0) ||
				(formData.note_c && formData.note_c > 0) ||
				(formData.note_d && formData.note_d > 0) ||
				(formData.note_e && formData.note_e > 0)
			)
		} else if (currentTab == "mainQuestion") {
			// make sure the question_note is not none
			return typeof formData.question_note == "number"
		} else if (parseInt(currentTab)) {
			// make sure there's a grade selected
			const question_id = parseInt(currentTab.replace("question_", ""))
			const question = thematique?.questions.find((question) => question.id == question_id)
			if (!question || question.optional) return true
			const reponse = formData.reponses?.find((reponse) => reponse.question_id == question.id)
			if (!reponse) return false
			return typeof reponse.note == "number"
		} else return true
	}

	// handle submit

	const onClose = () => {
		// reset form data
		form.reset()
		// close the form
		onOpenChange(false)
		setCurrentTab("intro")
	}

	const onSubmitHandler = async () => {
		if (!session || !evaluation) return
		// submit the evaluation to the API endpoint
		const submittedEval = await makeAPIRequest<Evaluation, Evaluation>(
			session,
			"put",
			"evaluations",
			`id/${evaluation.id}/submit/`,
			formData,
			(res) => res.data
		)
		if (!submittedEval || submittedEval instanceof Error) return
		onSubmit(submittedEval)
		onClose()
	}

	// render
	return thematique && evaluation ? (
		<Dialog open={open}>
			<DialogContent
				hideCloseButton
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
						<span className="text-xs font-medium text-fuchsia-600 bg-fuchsia-600/10 px-[16px] py-[8px] rounded-[8px] w-fit mt-[16px]">
							{thematique.nom}
						</span>
					</div>
				</div>
				<Tabs
					className="flex-1 w-full flex flex-col gap-[16px]"
					value={currentTab}>
					<Form {...form}>
						<form
							className="flex-1 w-full flex flex-col gap-[16px]"
							onSubmit={form.handleSubmit(onSubmitHandler)}>
							{currentTab == "intro" && (
								<TabsContent
									value="intro"
									className="m-0 flex-1 w-full flex flex-col gap-[16px]">
									<Alert variant="default">
										<FontAwesomeIcon
											icon={faInfoCircle}
											className="text-blue-600 text-[16px]"
										/>
										<AlertTitle>Description</AlertTitle>
										<AlertDescription>{thematique.description}</AlertDescription>
									</Alert>
									{thematique.grille_de_notes ? (
										<>
											<div className="w-full flex flex-col gap-[4px]">
												{thematique.question_grille ? (
													<span className="text-base font-medium text-blue-600">{thematique.question_grille}</span>
												) : (
													<></>
												)}
												<span className="text-sm font-normal text-blue-600/80">
													Indiquer votre appréciation par une note allant de A, très bien, à E, très mauvais.
												</span>
											</div>
											<div className="w-full flex flex-wrap gap-[16px]">
												{["a", "b", "c", "d", "e"].map((letter) => (
													<FormField
														key={letter}
														control={form.control}
														// @ts-ignore
														name={`note_${letter}`}
														render={({ field }) => (
															<FormItem className="flex-1">
																<FormControl>
																	<GradeCountInput
																		className="flex-1"
																		grade={letter.toUpperCase()}
																		count={field.value as number}
																		// @ts-ignore
																		onChange={(value) => form.setValue(`note_${letter}`, value)}
																		min={0}
																		max={100}
																	/>
																</FormControl>
																<FormDescription>
																	Nombre de <span className="uppercase">{letter}</span>
																</FormDescription>
															</FormItem>
														)}
													/>
												))}
											</div>
										</>
									) : (
										<></>
									)}
									<span className="text-sm font-normal text-blue-600/60">
										Au cours de votre évaluation vous indiquerez également vos remarques et commentaires à la fin de ce questionnaire.
									</span>
								</TabsContent>
							)}
							<FormField
								control={form.control}
								name="reponses"
								render={() => (
									<>
										{thematique.questions.map(
											(question, id) =>
												currentTab == question.id.toString() && (
													<TabsContent
														key={question.id}
														value={question.id.toString()}
														className="m-0 flex-1 w-full flex flex-col gap-[24px]">
														<div className="w-full flex flex-col gap-[4px]">
															<span className="text-xl font-bold text-blue-600">{question.titre ?? "Question"}</span>
															{question.description ? (
																<span className="text-sm font-normal text-blue-600/60">{question.description}</span>
															) : (
																<></>
															)}
															<span className="text-base font-semibold text-blue-600">{question.question}</span>
														</div>
														{question.grille ? (
															<div className="w-full flex flex-wrap gap-[16px]">
																{["a", "b", "c", "d", "e"].map((letter) => (
																	<FormField
																		key={letter}
																		control={form.control}
																		// @ts-ignore
																		name={`reponses.${id}.note_${letter}`}
																		render={({ field }) => (
																			<FormItem className="flex-1">
																				<FormControl>
																					<GradeCountInput
																						className="flex-1"
																						grade={letter.toUpperCase()}
																						count={(field.value as number) ?? 0}
																						onChange={(value) =>
																							// @ts-ignore
																							form.setValue(`reponses.${id}`, {
																								...form.getValues(`reponses.${id}`),
																								question_id: question.id,
																								[`note_${letter}`]: value
																							})
																						}
																						min={0}
																						max={100}
																					/>
																				</FormControl>
																				<FormDescription>
																					Nombre de <span className="uppercase">{letter}</span>
																				</FormDescription>
																			</FormItem>
																		)}
																	/>
																))}
															</div>
														) : (
															<GradeRadioGroup
																name={`question_${question.id}`}
																selected={numberToLetter(form.watch(`reponses.${id}.note`))}
																onSelect={(value) =>
																	form.setValue(`reponses.${id}`, { question_id: question.id, note: letterToNumber[value] })
																}
															/>
														)}
													</TabsContent>
												)
										)}
									</>
								)}
							/>
							{currentTab == "mainQuestion" && (
								<TabsContent
									value="mainQuestion"
									className="m-0 flex-1 w-full flex flex-col gap-[24px]">
									<div className="w-full flex flex-col gap-[4px]">
										<span className="text-xl font-bold text-blue-600">Question d'impression générale</span>
										<span className="text-sm font-normal text-blue-600/60">
											Afin de compléter votre évaluation, vous répondrez à la question suivante par une note allant de A (très bien) à E
											(très mauvais)
										</span>
										<span className="text-base font-semibold text-blue-600">{thematique.question}</span>
									</div>

									<GradeRadioGroup
										name="question_note"
										selected={numberToLetter(form.watch(`question_note`))}
										onSelect={(value) => form.setValue(`question_note`, letterToNumber[value])}
									/>
								</TabsContent>
							)}
							{currentTab == "comments" && (
								<TabsContent
									value="comments"
									className="m-0 flex-1 w-full flex flex-col gap-[24px]">
									{/* <div className="w-full flex flex-col gap-[4px]">
										<span className="text-xl font-bold text-blue-600">Remarque</span>
										<span className="text-sm font-normal text-blue-600/60"></span>
									</div> */}
									<FormField
										name="commentaire"
										control={form.control}
										render={({ field }) => (
											<FormItem className="flex-1">
												<div className="flex flex-col w-full gap-[4px]">
													<FormLabel>Commentaire</FormLabel>
													<FormDescription>Vous pouvez laisser vos commentaires et vos remarques dans ce champ</FormDescription>
												</div>
												<FormControl>
													<Textarea
														{...field}
														className="flex-1"
														placeholder="Remarques sur l'évaluation..."
														rows={4}
														maxLength={1000}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</TabsContent>
							)}
							<div className="w-full flex gap-[16px]">
								<Button
									type="button"
									variant="outline"
									className="flex-1 flex items-center gap-[16px]"
									onClick={goBack}>
									{currentTab == "intro" ? (
										"Annuler"
									) : (
										<>
											<FontAwesomeIcon
												icon={faArrowLeft}
												className="text-sm text-blue-600"
											/>
											Retour en arrière
										</>
									)}
								</Button>
								<Button
									type="button"
									disabled={!allowContinue()}
									className="flex-1 flex items-center gap-[16px]"
									onClick={goForward}>
									<FontAwesomeIcon
										icon={faArrowRight}
										className="text-sm text-neutral-50"
									/>
									{currentTab == "comments" ? "Soumettre" : "Continuer"}
								</Button>
							</div>
							<TabsList className="bg-transparent justify-start gap-[8px]">
								<TabsTrigger
									value="intro"
									className={cn(
										"h-[8px] p-0  flex-1 rounded-[8px] bg-blue-600/10 data-[state=active]:bg-blue-600",
										"data-[state=active]:shadow-none"
									)}>
									&nbsp;
								</TabsTrigger>
								{thematique.questions.map((question) => (
									<TabsTrigger
										key={question.id}
										value={question.id.toString()}
										className={cn(
											"h-[8px] p-0 flex-1 rounded-[8px] bg-blue-600/10 data-[state=active]:bg-blue-600",
											"data-[state=active]:shadow-none"
										)}>
										&nbsp;
									</TabsTrigger>
								))}
								<TabsTrigger
									value="mainQuestion"
									className={cn(
										"h-[8px] p-0 flex-1 rounded-[8px] bg-blue-600/10 data-[state=active]:bg-blue-600",
										"data-[state=active]:shadow-none"
									)}>
									&nbsp;
								</TabsTrigger>
								<TabsTrigger
									value="comments"
									className={cn(
										"h-[8px] p-0 flex-1 rounded-[8px] bg-blue-600/10 data-[state=active]:bg-blue-600",
										"data-[state=active]:shadow-none"
									)}>
									&nbsp;
								</TabsTrigger>
							</TabsList>
						</form>
					</Form>
				</Tabs>
			</DialogContent>
		</Dialog>
	) : (
		<></>
	)
}

export default EvaluationForm
