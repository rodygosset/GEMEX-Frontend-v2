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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem } from "./form"

interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
	evaluation: Evaluation
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
			grade: z.number().min(4).max(20)
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
		if (!session) return

		makeAPIRequest<Thematique, void>(session, "get", "thematiques", `id/${evaluation.thematique_id}`, undefined, (res) => setThematique(res.data))
	}

	useEffect(() => {
		if (!session) return
		getThematique()
	}, [session, evaluation])

	// handle navigation

	const goBack = () => {
		if (currentTab == "intro") onOpenChange(false)
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
			if (index != 1 && thematique && index < thematique.questions.length - 1) setCurrentTab(thematique.questions[index + 1].id.toString())
			else setCurrentTab("mainQuestion")
		}
	}

	// form state

	const form = useForm<z.infer<typeof evaluationFormSchema>>({
		resolver: zodResolver(evaluationFormSchema),
		defaultValues: {
			note_a: evaluation.note_a ?? 0,
			note_b: evaluation.note_b ?? 0,
			note_c: evaluation.note_c ?? 0,
			note_d: evaluation.note_d ?? 0,
			note_e: evaluation.note_e ?? 0,
			question_note: evaluation.question_note ?? 0,
			reponses: evaluation.reponses,
			commentaire: evaluation.commentaire
		}
	})

	// handle submit

	const onSubmitHandler = () => {
		// todo: submit the evaluation
		onOpenChange(false)
		setCurrentTab("intro")
	}

	// render
	return thematique ? (
		<Dialog open={open}>
			<DialogContent
				hideCloseButton
				className={cn(
					"w-full sm:max-w-[600px] max-h-[80vh] sm:max-h-[576px] h-full bg-neutral-50 p-[32px]",
					"max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0 max-sm:max-w-full",
					"flex flex-col gap-[32px]"
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
								<div className="w-full flex flex-wrap gap-[16px] justify-between">
									<FormField
										control={form.control}
										name="note_a"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<GradeCountInput
														grade="A"
														count={field.value}
														onChange={(value) => form.setValue("note_a", value)}
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>
								<div className="flex-1 w-full">&nbsp;</div>
							</TabsContent>
							<div className="w-full flex gap-[16px]">
								<Button
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
