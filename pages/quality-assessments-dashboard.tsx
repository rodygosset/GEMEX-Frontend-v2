import EvaluationCard from "@components/radix/evaluation-card"
import { Evaluation } from "@conf/api/data-types/quality-module"
import { MySession } from "@conf/utility-types"
import { faChartPie } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import SSRmakeAPIRequest from "@utils/ssr-make-api-request"
import { cn } from "@utils/tailwind"
import { GetServerSideProps, NextPage } from "next"
import { getSession } from "next-auth/react"
import { useState } from "react"

interface Category {
	id: number
	name: string
	description: string
	getEvaluations: (evaluations: Evaluation[]) => Evaluation[]
}

const categories: Category[] = [
	{
		id: 1,
		name: "À réaliser",
		description: "Les évaluations à faire",
		getEvaluations: (evaluations) => evaluations.filter((evaluation) => !evaluation.date_rendu_reelle)
	},
	{
		id: 2,
		name: "Complétées",
		description: "Les évaluations en attente de validation",
		getEvaluations: (evaluations) => evaluations.filter((evaluation) => evaluation.date_rendu_reelle && !evaluation.approved)
	},
	{
		id: 3,
		name: "Validées",
		description: "Les évaluations complétées et validées",
		getEvaluations: (evaluations) => evaluations.filter((evaluation) => evaluation.approved)
	}
]

interface Props {
	initEvaluations: Evaluation[]
}

const QualityAssessmentsDashboard: NextPage<Props> = ({ initEvaluations }: Props) => {
	const [evaluations, setEvaluations] = useState(initEvaluations)

	// render

	return (
		<main className="flex flex-col px-[7%] gap-[32px] pt-[32px]">
			<div className="w-full flex items-center gap-[16px] min-[480px]:gap-[32px]">
				<FontAwesomeIcon
					icon={faChartPie}
					className="text-3xl min-[480px]:text-5xl text-blue-600"
				/>
				<div className="flex flex-col">
					<h1 className="text-xl min-[480px]:text-2xl text-blue-600 font-semibold">Démarche Qualité</h1>
					<p className="text-xs min-[480px]:text-base text-blue-600 text-opacity-40 tracking-widest uppercase">Gestion des évaluations</p>
				</div>
			</div>
			<ul className="w-full flex-1 flex flex-wrap gap-[32px] max-sm:flex-col">
				{categories.map((category) => (
					<li
						key={category.id}
						className="flex-1 flex flex-col gap-[16px] sm:min-w-[340px]">
						<div className="w-full flex gap-[16px] items-center">
							<div
								className={cn(
									"h-[8px] aspect-square rounded-full",
									category.id == 1 && "bg-yellow-600",
									category.id == 2 && "bg-fuchsia-600",
									category.id == 3 && "bg-emerald-600"
								)}>
								&nbsp;
							</div>
							<div className="w-full flex flex-col">
								<h2 className="text-xl text-blue-600 font-semibold">{category.name}</h2>
								<span className="text-base text-blue-600/60 font-normal">{category.description}</span>
							</div>
						</div>
						<ul className="w-full flex flex-col gap-[8px]">
							{category.getEvaluations(evaluations).map((evaluation) => (
								<EvaluationCard
									key={evaluation.id}
									evaluation={evaluation}
									onChange={(evaluation) => {
										setEvaluations(evaluations.map((e) => (e.id == evaluation.id ? evaluation : e)))
									}}
								/>
							))}
						</ul>
					</li>
				))}
			</ul>
		</main>
	)
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
	const emptyProps: Props = {
		initEvaluations: []
	}

	// get the session

	const session = (await getSession(ctx)) as MySession | null

	if (!session) return { props: emptyProps }

	// get the user's evaluations

	const evaluations = await SSRmakeAPIRequest<Evaluation[], Evaluation[]>({
		session,
		verb: "post",
		itemType: "evaluations",
		additionalPath: "search",
		data: {
			user_id: session.user.id
		},
		onSuccess: (res) => res.data
	})

	return {
		props: {
			initEvaluations: evaluations ?? []
		}
	}
}

export default QualityAssessmentsDashboard
