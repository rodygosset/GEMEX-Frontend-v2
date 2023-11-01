import BarChart from "@components/charts/bar-chart"
import SectionContainer from "@components/layout/quality/section-container"
import { Cycle } from "@conf/api/data-types/quality-module"
import { faCircle, faDownload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"

interface Props {
	cycle: Cycle
}

const ChartWidget = ({ cycle }: Props) => {
	// state

	const [imageLink, setImageLink] = useState<string>("")

	// utils

	const getLabels = (cycle: Cycle) => {
		// get the names of the months between the start and end dates of the cycle in an array
		const months = []
		// get the start and end dates of the cycle
		const startDate = new Date(cycle.date_debut)
		const endDate = new Date(cycle.date_fin)
		// for each month between the start and end dates, add the name of the month to the array
		for (let i = startDate; i <= endDate; i.setMonth(i.getMonth() + 1)) {
			let month = i.toLocaleString("fr-fr", { month: "long" })
			// capitalize the first letter of the month name && add it to the array
			months.push(month.charAt(0).toUpperCase() + month.slice(1) + " " + i.getFullYear())
		}
		return months
	}

	const getNbMonths = (cycle: Cycle) => {
		// get the start and end dates of the cycle
		const startDate = new Date(cycle.date_debut)
		const endDate = new Date(cycle.date_fin)
		// get the number of months between the start and end dates
		const nbMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1
		return nbMonths
	}

	const getChartData = (cycle: Cycle) => {
		const nbMonths = getNbMonths(cycle)
		// for each month of the cycle, add the satisfaction rate to the array
		const data = []
		for (let i = 0; i < nbMonths; i++) {
			if (i < cycle.mois_cycle.length) {
				data.push(cycle.mois_cycle[i].note || 0)
			} else {
				data.push(0)
			}
		}
		return data
	}

	const getLatestMonth = (cycle: Cycle) => {
		if (cycle.mois_cycle.length == 0) return
		return cycle.mois_cycle.reduce((acc, curr) => {
			if (curr.mois > acc.mois) return curr
			return acc
		})
	}

	const getLatestMonthLabel = (cycle: Cycle) => {
		const latestMonth = getLatestMonth(cycle)
		if (!latestMonth) return
		const labels = getLabels(cycle)
		return labels[latestMonth.mois - 1]
	}

	const getLatestMonthData = (cycle: Cycle) => {
		const latestMonth = getLatestMonth(cycle)
		if (!latestMonth) return 0
		return latestMonth.note || 0
	}

	const getDistanceToGoal = (note: number) => {
		// goal is 16/20
		return note - 16
	}

	const getAverage = (cycle: Cycle) => {
		const data = getChartData(cycle)
		const sum = data.reduce((acc, curr) => acc + curr)
		return data.length > 0 ? sum / data.length : 0
	}

	// handle downloads

	const dataToCSV = (cycle: Cycle) => {
		const data = getChartData(cycle)
		const labels = getLabels(cycle)
		let csv = "data:text/csv;charset=utf-8," + "\ufeff"
		csv += "Mois;Note qualité\n"
		for (let i = 0; i < data.length; i++) {
			csv += labels[i] + ";" + data[i] + "\n"
		}
		return encodeURI(csv)
	}

	// render

	return (
		<SectionContainer>
			<div className="w-full flex flex-row justify-between max-[480px]:flex-col">
				<div className="flex flex-col">
					<h3 className="text-xl font-semibold text-blue-600">Taux qualité annuel</h3>
					<p className="text-base font-normal text-blue-600/60">Pour le cycle en cours</p>
				</div>
				<div className="flex flex-col items-end max-[480px]:items-start">
					<span>
						<b className={`text-3xl ${getAverage(cycle) < 10 ? "text-error" : getAverage(cycle) < 15 ? "text-warning" : "text-success"}`}>
							{getAverage(cycle).toFixed(2)}
						</b>
						<span className="text-sm font-normal text-blue-600/80">/20</span>
					</span>
					<span className="text-end max-[480px]:text-start">
						<b className={`text-sm ${getDistanceToGoal(getAverage(cycle)) < 0 ? "text-error" : "text-success"}`}>
							{getDistanceToGoal(getAverage(cycle)).toFixed(2)}
						</b>
						<span className="text-sm font-normal text-blue-600/80"> par rapport à l'objectif</span>
					</span>
				</div>
			</div>
			<div className="w-full flex flex-col gap-4">
				<div className="w-full flex flex-col items-center justify-center h-[300px]">
					<BarChart
						options={{
							scales: {
								y: {
									beginAtZero: true,
									max: 20
								}
							}
						}}
						label="Note qualité"
						data={getChartData(cycle)}
						labels={getLabels(cycle)}
						onDownloadLinkReady={setImageLink}
					/>
				</div>
				{cycle.mois_cycle.length > 0 ? (
					<div className="w-full flex flex-row flex-wrap items-center">
						<span className="text-sm text-blue-600/80">
							<b className={getLatestMonthData(cycle) < 10 ? "text-error" : getLatestMonthData(cycle) < 15 ? "text-warning" : "text-success"}>
								{getLatestMonthData(cycle).toFixed(2)}
							</b>{" "}
							au mois de <span className="lowercase">{getLatestMonthLabel(cycle)}</span>
						</span>
						<FontAwesomeIcon
							icon={faCircle}
							className="text-blue-600/40 mx-4 text-[0.4rem]"
						/>
						<span className="text-sm text-blue-600/80">
							<b className={getDistanceToGoal(getLatestMonthData(cycle)) < 0 ? "text-error" : "text-success"}>
								{getDistanceToGoal(getLatestMonthData(cycle)).toFixed(2)}
							</b>{" "}
							{getDistanceToGoal(getLatestMonthData(cycle)) > 0 ? "au-dessus" : "points en-dessous"} de l'objectif
						</span>
					</div>
				) : (
					<></>
				)}
				<div className="w-full flex flex-row gap-4 max-[480px]:flex-wrap">
					<a
						className="w-full bg-blue-600/10 rounded-[8px] px-[16px] py-[8px] 
                        flex flex-row justify-center items-center gap-4 hover:bg-blue-600/20 transition duration-300 ease-in-out cursor-pointer"
						download={`graphique-taux-qualite-${cycle.date_debut}-${cycle.date_fin}.png`}
						href={imageLink}>
						<FontAwesomeIcon
							icon={faDownload}
							className="text-blue-600"
						/>
						<span className="font-normal text-sm text-blue-600 whitespace-nowrap">Télécharger l'image</span>
					</a>
					<a
						className="w-full bg-blue-600 rounded-[8px] px-[16px] py-[8px] 
                        flex flex-row justify-center items-center gap-4 hover:shadow-2xl hover:shadow-primary transition duration-300 ease-in-out cursor-pointer"
						download={`resultats-taux-qualite-${cycle.date_debut}-${cycle.date_fin}.csv`}
						href={dataToCSV(cycle)}>
						<FontAwesomeIcon
							icon={faDownload}
							className="text-white"
						/>
						<span className="text-sm font-normal text-white whitespace-nowrap">Export Excel</span>
					</a>
				</div>
			</div>
		</SectionContainer>
	)
}

export default ChartWidget
