import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@components/radix/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@components/radix/form"
import { Evaluation, EvaluationCreate } from "@conf/api/data-types/quality-module"
import { faEdit, faFloppyDisk, faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import ItemComboBox from "@components/radix/item-combobox"
import Button from "@components/button"
import { useEffect, useState } from "react"
import { DatePicker } from "@components/radix/date-picker"
import { ScrollArea } from "@components/radix/scroll-area"
import useAPIRequest from "@hook/useAPIRequest"
import { MySession } from "@conf/utility-types"
import { useSession } from "next-auth/react"
import { toISO } from "@utils/general"

interface Props {
	mois_cycle_id: number
	evaluation?: Evaluation
	onSubmit: () => void
}

const getTomorrow = () => {
	const date = new Date()
	date.setDate(date.getDate() + 1)
	return date
}

// form schema

const formSchema = z.object({
	mois_cycle_id: z.number().min(1, {
		message: "Veuillez sélectionner un mois"
	}),
	thematique_id: z.number().min(1, {
		message: "Veuillez sélectionner une thématique"
	}),
	user_id: z
		.number()
		.min(1, {
			message: "Veuillez sélectionner un évaluateur"
		})
		.optional(),
	element_id: z.number().min(1, {
		message: "Veuillez sélectionner un élément"
	}),
	date_rendu: z.date().min(getTomorrow(), {
		message: "La date de rendu doit être supérieure ou égale à la date du jour"
	})
})

const EvaluationFormModal = ({ mois_cycle_id, evaluation, onSubmit }: Props) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			mois_cycle_id: mois_cycle_id,
			thematique_id: evaluation ? evaluation.thematique_id : 0,
			user_id: evaluation ? evaluation.user_id : 0,
			element_id: evaluation ? evaluation.element_id : 0,
			date_rendu: evaluation ? new Date(evaluation.date_rendu) : getTomorrow()
		}
	})

	// handlers

	const onSuccess = () => {
		form.control._reset()
		setIsOpen(false)
		onSubmit()
	}

	// form submit handler

	const makeAPIRequest = useAPIRequest()
	const session = useSession().data as MySession | null

	const onSubmitHandler = (data: z.infer<typeof formSchema>) => {
		if (!session) return

		// make a request to the API to create the evaluation in the database

		makeAPIRequest<EvaluationCreate, void>(
			session,
			"post",
			"evaluations",
			undefined,
			{
				...data,
				date_rendu: toISO(data.date_rendu)
			},
			onSuccess
		)
	}

	// state

	const [isOpen, setIsOpen] = useState(false)

	const [expositionId, setExpositionId] = useState<number>(0)

	useEffect(() => {
		if (expositionId == 0) form.setValue("element_id", 0)
	}, [expositionId])

	// render

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}>
			{evaluation ? (
				<DialogTrigger>
					<FontAwesomeIcon icon={faEdit} />
				</DialogTrigger>
			) : (
				<DialogTrigger
					onClick={() => setIsOpen(true)}
					className="bg-blue-600 h-fit rounded-[8px] px-4 py-[8px] text-sm text-white flex flex-row gap-4 items-center
                            hover:shadow-primary/60 hover:shadow-2xl transition-shadow duration-200 cursor-pointer">
					<FontAwesomeIcon icon={faPlus} />
					Nouvelle évaluation
				</DialogTrigger>
			)}
			<DialogContent className="sm:max-h-[90vh] h-fit w-screen sm:w-fit sm:min-w-[400px] max-sm:max-w-full p-[32px] max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0">
				<DialogHeader className="border-none pb-0">
					<DialogTitle>{evaluation ? "Modifier l'évaluation" : "Nouvelle évaluation"}</DialogTitle>
					<DialogDescription>
						{evaluation ? "Modifier les paramètres de l'évaluation" : "Renseigner les paramètres de l'évaluation"}
					</DialogDescription>
				</DialogHeader>
				<div className="w-full h-[1px] bg-blue-600/10 my-4" />
				<ScrollArea className="w-full h-[500px]">
					<Form {...form}>
						<form
							className="flex flex-col gap-[32px]"
							onSubmit={form.handleSubmit(onSubmitHandler)}>
							<FormField
								control={form.control}
								name="thematique_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Thématique</FormLabel>
										<FormControl>
											<ItemComboBox
												itemType="thematiques"
												onChange={(value) => form.setValue("thematique_id", value)}
												field={field}
											/>
										</FormControl>
										<FormDescription>Choisir la thématique à évaluer</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="user_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Évaluateur</FormLabel>
										<FormControl>
											<ItemComboBox
												itemType="users"
												onChange={(value) => form.setValue("user_id", value)}
												field={field}
											/>
										</FormControl>
										<FormDescription>Choisir l&apos;évaluateur</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="date_rendu"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Date de rendu prévue</FormLabel>
										<FormControl>
											<DatePicker
												fullWidth
												selected={field.value}
												onSelect={(date) => date && form.setValue("date_rendu", date)}
												disabled={(date) => date < new Date()}
											/>
										</FormControl>
										<FormDescription>Choisir la date de rendu prévue</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="element_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Élément à évaluer</FormLabel>
										<FormControl>
											<>
												<div className="flex flex-col gap-2 flex-1">
													<span className="text-sm text-blue-600/60">Séléctionner l&apos;exposition de l&apos;élément</span>
													<ItemComboBox
														selected={expositionId}
														itemType="expositions"
														onChange={setExpositionId}
														field={field}
													/>
												</div>
												<div className="flex flex-col gap-2 flex-1">
													<span className="text-sm text-blue-600/60">Élément</span>
													<ItemComboBox
														itemType="elements"
														searchParams={{ exposition_id: expositionId }}
														onChange={(value) => form.setValue("element_id", value)}
														field={field}
													/>
												</div>
											</>
										</FormControl>
										<FormDescription>Choisir l&apos;élément à évaluer</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</ScrollArea>
				<Button
					fullWidth
					icon={faFloppyDisk}
					type="submit"
					onClick={form.handleSubmit(onSubmitHandler)}>
					Sauvegarder
				</Button>
			</DialogContent>
		</Dialog>
	)
}

export default EvaluationFormModal
