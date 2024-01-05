import DateRangeStep from "@components/availability-ratio-reports/date-range-step"
import ExpoGroupsStep from "@components/availability-ratio-reports/expo-groups-step"
import { MySession } from "@conf/utility-types"
import { faChevronLeft, faCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import useAPIRequest from "@hook/useAPIRequest"
import styles from "@styles/pages/availability-ratio-reports/create.module.scss"
import { ExpoGroupCreate, RapportCreate, RapportTauxDisponibilite } from "@conf/api/data-types/rapport"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { DateRange } from "@utils/types"
import ResultsStep from "@components/availability-ratio-reports/results-step"

const steps = ["Période", "Groupes d'expositions", "Résultats"]

const CreateReport = () => {
	// state

	const [currentStep, setCurrentStep] = useState(0)

	const [dateRange, setDateRange] = useState<DateRange>({
		// startDate by default is the first day of the current month
		startDate: new Date(new Date().setDate(1)),
		// endDate by default is the first day of the next month
		endDate: new Date(new Date(new Date().setDate(1)).setMonth(new Date().getMonth() + 1))
	})

	const [expoGroups, setExpoGroups] = useState<ExpoGroupCreate[]>([])

	const [report, setReport] = useState<RapportTauxDisponibilite | null>(null)

	// effects

	const makeAPIRequest = useAPIRequest()

	const session = useSession().data as MySession | null

	useEffect(() => {
		if (currentStep !== 2 || !session || report !== null) return

		// when the user reaches the last step, we send the data to the server

		// reformat the data to match the API's documentation

		const requestBody: RapportCreate = {
			date_debut: dateRange.startDate.toISOString().split("T")[0],
			date_fin: dateRange.endDate.toISOString().split("T")[0],
			groupes_expositions: expoGroups.map((expoGroup) => ({
				nom: expoGroup.nom,
				expositions: expoGroup.expositions.map((expo) => ({
					exposition_id: expo.id
				}))
			}))
		}

		makeAPIRequest<RapportTauxDisponibilite, void>(
			session,
			"post",
			"rapports",
			undefined,
			requestBody,
			// the response is the initial report object
			(res) => setReport(res.data)
		)
	}, [currentStep, session])

	// console log the report when it changes

	useEffect(() => {
		if (!report) return

		// if the taux is null, hit the "done" API endpoint until it returns true
		// // then update the report object by making a GET request to the API
		// then navigate to the results step page

		if (report.taux !== null || !session) return

		const interval = setInterval(() => {
			makeAPIRequest<{ done: boolean }, void>(session, "get", "rapports", `id/${report.id}/done`, undefined, (res) => {
				if (!res.data.done) return
				clearInterval(interval)
				router.push(`/availability-ratio-reports/view/${report.id}`)
			})
		}, 1000)

		return () => clearInterval(interval)
	}, [report, session])

	// handlers

	const router = useRouter()

	const handleGoBack = () => {
		if (currentStep > 0) setCurrentStep(currentStep - 1)
		else router.push("/availability-ratio-reports")
	}

	// utils

	const getContent = () => {
		switch (currentStep) {
			case 0:
				return (
					<DateRangeStep
						dateRange={dateRange}
						onChange={setDateRange}
						onNextStep={() => setCurrentStep(currentStep + 1)}
					/>
				)
			case 1:
				return (
					<ExpoGroupsStep
						expoGroups={expoGroups}
						dateRange={dateRange}
						onChange={setExpoGroups}
						onNextStep={() => setCurrentStep(currentStep + 1)}
					/>
				)
			case 2:
				return <ResultsStep report={report} />
			default:
				return <></>
		}
	}

	// render

	return (
		<main id={styles.container}>
			<section className={styles.header}>
				{currentStep !== 2 ? (
					<button
						className={styles.goBackButton}
						onClick={handleGoBack}>
						<FontAwesomeIcon icon={faChevronLeft} />
					</button>
				) : (
					<></>
				)}
				<div>
					<h2>Nouveau rapport</h2>
					<p>
						<span>Etape {currentStep + 1}</span>
						<FontAwesomeIcon icon={faCircle} />
						<span>{steps[currentStep]}</span>
					</p>
				</div>
			</section>
			{getContent()}
		</main>
	)
}

export default CreateReport
