// import BarChart from "@components/charts/bar-chart"
import BarChart from "@components/charts/bar-chart-modern"
import { MySession } from "@conf/utility-types"
import useAPIRequest from "@hook/useAPIRequest"
import { cn } from "@utils/tailwind"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

const labels = ["Opérations", "Pannes", "Systématiques"]

const OperationReportsChartCard = () => {
	const [data, setData] = useState<number[]>([])

	// get data for each type of fiche

	const makeAPIRequest = useAPIRequest()
	const session = useSession().data as MySession | null

	const getFicheTypeCount = async (type: string) => {
		if (!session) return

		return await makeAPIRequest<{ nb_results: number }, number>(
			session,
			"post",
			type == "Systématique" ? "fiches_systematiques" : "fiches",
			"search/nb",
			{
				groups: session.user.groups.length > 0 ? [session.user.groups[0]] : [],
				status_id: 2,
				is_active: true,
				tags: [type]
			},
			(res) => res.data.nb_results
		)
	}

	useEffect(() => {
		const fetchData = async () => {
			const fiches = await Promise.all([getFicheTypeCount("Opération"), getFicheTypeCount("Panne"), getFicheTypeCount("Systématique")])

			setData(fiches.map((fiche) => (fiche && !(fiche instanceof Error) ? fiche : 0)))
		}

		fetchData()
	}, [session])

	// render

	return (
		<section
			className={cn(
				"w-full min-w-[320px] flex-1 h-[416px] p-[32px] rounded-[8px] border border-blue-600/20 shadow-2xl shadow-blue-600/20",
				"flex flex-col gap-4"
			)}>
			<div className="flex flex-col">
				<h3 className="text-base font-semibold text-blue-600">Vue d&apos;ensemble</h3>
				<span className="text-sm font-normal text-blue-600/60">Fiches en cours dans le groupe</span>
			</div>
			<div className="w-full flex flex-col items-center justify-center min-h-[200px] h-full">
				<BarChart data={data.map((value, index) => ({ name: labels[index], value }))} />
			</div>
		</section>
	)
}

export default OperationReportsChartCard
