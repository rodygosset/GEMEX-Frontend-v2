import OperationReportCard from "@components/cards/operation-report-card"
import { Fiche, FicheSystematique } from "@conf/api/data-types/fiche"
import { FigureCardType, MySession } from "@conf/utility-types"
import { faBox, faChartPie, faHourglassHalf, faPlus, faSquareCheck } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import SSRmakeAPIRequest from "@utils/ssr-make-api-request"
import { cn } from "@utils/tailwind"
import { GetServerSideProps, NextPage } from "next"
import { getSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import OperationReportsChartCard from "@components/cards/operation-reports-chart-card"
import { toISO } from "@utils/general"
import { TO_BE_ASSIGNED_TAG } from "@conf/api/conf"
import FigureCard from "@components/cards/figure-card"
import { Evaluation } from "@conf/api/data-types/quality-module"

interface Props {
	fiches: Fiche[]
	figureCards: FigureCardType[]
}

const Home: NextPage<Props> = ({ fiches, figureCards }: Props) => {
	// render

	return (
		<main className="flex flex-col px-[7%] gap-[32px] pt-[32px]">
			<section className="w-full flex flex-col gap-4">
				<div className="flex flex-col">
					<h3 className="text-2xl font-semibold text-blue-600">En cours</h3>
					<span className="text-base font-normal text-blue-600/60">Fiches en cours de traitement dont vous êtes en charge</span>
				</div>
				<div className="w-screen overflow-x-scroll pl-[7%] py-[32px] ml-[-7%] no-scrollbar">
					<ul className="w-full flex items-center gap-4">
						{fiches.length > 0 ? (
							fiches.map((fiche) => (
								<li key={fiche.id}>
									<OperationReportCard fiche={fiche} />
								</li>
							))
						) : (
							<li
								className={cn(
									"w-[320px] min-w-[320px] h-[200px]  rounded-[8px]",
									"flex flex-col items-center justify-center gap-4",
									"border-dashed border-2 border-blue-600/20"
								)}>
								<div className="h-[120px] w-full relative aspect-[1.226]">
									<Image
										quality={100}
										src={"/images/no-results-illustration.svg"}
										alt={"Aucun résultat."}
										priority
										fill
										style={{
											objectFit: "contain",
											top: "auto"
										}}
									/>
								</div>
								<span className="text-blue-600/80 text-sm font-normal text-center">Aucune fiche en cours</span>
							</li>
						)}
						<li>
							<Link
								href="/create/fiches"
								className={cn(
									"w-[320px] h-[200px]  rounded-[8px]",
									"flex flex-col items-center justify-center gap-4",
									"border-dashed border-2 border-blue-600/20",
									"text-base text-blue-600",
									"hover:bg-blue-600/5 transition-all duration-300 ease-in-out"
								)}>
								<FontAwesomeIcon icon={faPlus} />
								<span className="text-sm font-normal text-blue-600/60">Créer une fiche</span>
							</Link>
						</li>
					</ul>
				</div>
			</section>
			<section className="w-full flex flex-col gap-4">
				<div className="flex flex-col">
					<h3 className="text-2xl font-semibold text-blue-600">Données</h3>
					<span className="text-base font-normal text-blue-600/60">Informations utiles sur les opérations en cours</span>
				</div>
				<div className="w-full flex md:flex-wrap-reverse max-md:flex-col-reverse gap-4">
					<OperationReportsChartCard />
					<div className="flex-1 flex max-md:flex-wrap gap-4">
						<div className="max-[1153px]:flex-1 flex flex-col gap-4">
							{figureCards.slice(0, 2).map((figureCard) => (
								<FigureCard
									className="max-[1153px]:w-full"
									key={figureCard.title}
									figureCard={figureCard}
								/>
							))}
						</div>
						<div className="max-[1153px]:flex-1 flex flex-col gap-4">
							{figureCards.slice(2).map((figureCard) => (
								<FigureCard
									className="max-[1153px]:w-full"
									key={figureCard.title}
									figureCard={figureCard}
								/>
							))}
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}

// get server side props

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
	// start by getting the user's session

	const session = (await getSession(ctx)) as MySession | null

	if (!session) return { props: { fiches: [], figureCards: [] } }

	// get the user's ongoing operation reports from the API

	const fiches = await SSRmakeAPIRequest<Fiche[], Fiche[]>({
		session,
		verb: "post",
		itemType: "fiches",
		additionalPath: "search/",
		data: {
			is_active: true,
			user_en_charge_id: session.user.id,
			status_id: 2 // en cours
		},
		onSuccess: (res) => res.data
	})

	// get the data for the figure cards

	const values = [
		// malfunctions
		(await SSRmakeAPIRequest<{ nb_results: number }, number>({
			session,
			verb: "post",
			itemType: "fiches",
			additionalPath: "search/nb",
			data: {
				tags: ["Panne"],
				date_debut: toISO(new Date()),
				is_active: true,
				status_id: 2 // en cours
			},
			onSuccess: (res) => res.data.nb_results
		})) ?? 0,
		(await SSRmakeAPIRequest<Evaluation[], number>({
			session,
			verb: "post",
			itemType: "evaluations",
			additionalPath: "search",
			data: {
				user_id: session.user.id
			},
			onSuccess: (res) => res.data.filter((e) => !e.approved).length
		})) ?? 0,
		// periodic reports to be assigned
		(await SSRmakeAPIRequest<{ nb_results: number }, number>({
			session,
			verb: "post",
			itemType: "fiches_systematiques",
			additionalPath: "search/nb",
			data: {
				is_active: true,
				tags: [TO_BE_ASSIGNED_TAG],
				groups: session.user.groups.length > 0 ? [session.user.groups[0]] : []
			},
			onSuccess: (res) => res.data.nb_results
		})) ?? 0,
		// periodic reports to be completed
		(await SSRmakeAPIRequest<FicheSystematique[], number>({
			session,
			verb: "post",
			itemType: "fiches_systematiques",
			additionalPath: "search/",
			data: {
				is_active: true,
				user_en_charge_id: session.user.id
			},
			onSuccess: (res) => {
				// filter out reports that have the TO_BE_ASSIGNED_TAG
				return res.data.filter((fiche) => !fiche.tags.includes(TO_BE_ASSIGNED_TAG)).length
			}
		})) ?? 0
	]

	const figureCardsData: FigureCardType[] = [
		{
			title: "Éléments en panne",
			caption: "Pannes en cours",
			color: "from-fuchsia-700 to-red-600",
			icon: faBox,
			link: `/search?item=fiches&tags=Panne&date_debut=${toISO(new Date())}&is_active=true&status_id=2`,
			value: values[0]
		},
		{
			title: "Évaluations qualité à réaliser",
			caption: "Au total",
			color: "from-violet-700 to-fuchsia-700",
			icon: faChartPie,
			link: "/quality-assessments-dashboard",
			value: values[1]
		},
		{
			title: "Fiches systématiques en attente de distribution",
			caption: "Au sein de votre équipe",
			color: "from-blue-600 to-emerald-600",
			icon: faHourglassHalf,
			link: `/search?item=fiches_systematiques&is_active=true&tags=${TO_BE_ASSIGNED_TAG}${
				session.user.groups.length > 0 ? "&groups=" + session.user.groups[0] : ""
			}`,
			value: values[2]
		},
		{
			title: "Fiche systématiques à réaliser",
			caption: "Au total",
			color: "from-blue-600 to-emerald-600",
			icon: faSquareCheck,
			link: `/search?item=fiches_systematiques&is_active=true&user_en_charge_id=${session.user.id}`,
			value: values[3]
		}
	]

	// return the props

	return {
		props: {
			fiches: fiches ?? [],
			figureCards: figureCardsData ?? []
		}
	}
}

export default Home
