import { RapportTauxDisponibilite } from "@conf/api/data-types/rapport"
import { MySession } from "@conf/utility-types"
import useAPIRequest from "@hook/useAPIRequest"
import { Context } from "@utils/context"
import { parseURLQuery } from "@utils/search-utils"
import SSRmakeAPIRequest from "@utils/ssr-make-api-request"
import { DynamicObject } from "@utils/types"
import { AxiosResponse } from "axios"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { useSession } from "next-auth/react"
import { authOptions } from "pages/api/auth/[...nextauth]"
import { useContext, useEffect, useRef, useState } from "react"
import Image from "next/image"

import styles from "@styles/pages/availability-ratio-reports/search.module.scss"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"
import FieldContainer from "@components/form-elements/field-container"
import Label from "@components/form-elements/label"
import DateInput from "@components/form-elements/date-input"
import Select from "@components/form-elements/select"
import { toISO } from "@utils/general"
import ReportCard from "@components/cards/availability-ratio-reports/report-card"
import Pagination from "@components/pagination"
import LoadingIndicator from "@components/utils/loading-indicator"
import FilterWrapper from "@components/search-filters/filter-wrapper"
import FilterCheckBox from "@components/search-filters/filter-checkbox"

const resultsPerPage = 30

interface FormDateRange {
	startDate?: Date
	endDate?: Date
}

interface Props {
	initSearchParams: DynamicObject
	initReports: RapportTauxDisponibilite[]
}

const Search = ({ initSearchParams, initReports }: Props) => {
	const makeAPIRequest = useAPIRequest()
	const session = useSession().data as MySession | null

	// state

	// search params

	const [searchParams, setSearchParams] = useState<DynamicObject>(initSearchParams)
	const [checkedFilters, setCheckedFilters] = useState<string[]>([])

	const toggleFilter = (filter: string) => {
		if (checkedFilters.includes(filter)) {
			setCheckedFilters(checkedFilters.filter((f) => f !== filter))
		} else setCheckedFilters([...checkedFilters, filter])
	}

	const [dateRange, setDateRange] = useState<FormDateRange>({})

	const [groupesExpositions, setGroupesExpositions] = useState<string[]>([])
	const [selectedGroupesExpositions, setSelectedGroupesExpositions] = useState<string[]>([])

	const getGroupesExpositions = () => {
		if (!session) return
		makeAPIRequest<string[], void>(session, "get", "rapports", "groupes_expositions/noms", undefined, (res) => setGroupesExpositions([...res.data]))
	}

	useEffect(() => {
		getGroupesExpositions()
	}, [session])

	// make sure we don't update the search params object
	// until the default search params have been loaded

	const [defaultSearchParamsLoaded, setDefaultSearchParamsLoaded] = useState(false)

	useEffect(() => {
		if (!defaultSearchParamsLoaded && JSON.stringify(initSearchParams) == JSON.stringify(searchParams)) {
			setDefaultSearchParamsLoaded(true)
		}
	}, [searchParams])

	// when either dateRange or selectdGroupesExpositions change
	// update the search params

	useEffect(() => {
		if (!defaultSearchParamsLoaded) return

		// if the date range is valid, update the search params

		setSearchParams({
			...(dateRange.startDate && checkedFilters.includes("date-debut") ? { date_debut: toISO(dateRange.startDate) } : {}),
			...(dateRange.endDate && checkedFilters.includes("date-fin") ? { date_fin: toISO(dateRange.endDate) } : {}),
			...(selectedGroupesExpositions.length > 0 ? { groupes_expositions: selectedGroupesExpositions } : {})
		})
	}, [dateRange, selectedGroupesExpositions, checkedFilters])

	// console log changes to search params

	useEffect(() => console.log("search params => ", searchParams), [searchParams])

	// search results

	const [reports, setReports] = useState<RapportTauxDisponibilite[]>(initReports)

	// data fetching & pagination logic

	const [isLoading, setIsLoading] = useState(false)

	// we need to cancel on-going search requests
	// after a new one has been made
	// for that purpose, we use the native AbortController

	const reqController = useRef<AbortController>()

	const [currentPageNb, setCurrentPageNb] = useState(1)
	const [nbResults, setNbResults] = useState(0)
	const [totalPagesNb, setTotalPagesNb] = useState(1)

	// on each search request, get the number of results
	// & compute the total number of pages

	const getNbResults = () => {
		if (!session) return

		// make a request to our API to get the number of search results
		// & divide that by the number of results per page
		makeAPIRequest<{ nb_results: number }, void>(
			session,
			"post",
			"rapports",
			"search/nb",
			searchParams,
			(res: AxiosResponse<{ nb_results: number }>) => setNbResults(res.data.nb_results),
			() => console.log("search params => ", searchParams)
		)
	}

	useEffect(getNbResults, [reports, session])

	useEffect(() => setTotalPagesNb(Math.ceil(nbResults / resultsPerPage)), [nbResults])

	// go back to the first page
	// when the search parameters change

	useEffect(() => {
		setCurrentPageNb(1)
		getNbResults()
	}, [searchParams])

	// fetch data on page change
	// & when the item type or the search params are updated

	useEffect(() => {
		if (!session || !defaultSearchParamsLoaded) return

		// let the user know we're fetching data

		setIsLoading(true)

		// cancel previous request if it exists

		if (typeof reqController.current != "undefined") reqController.current.abort()

		// new abort controller for the new request we're going to make

		reqController.current = new AbortController()

		// make a request to our backend API

		makeAPIRequest<RapportTauxDisponibilite[], void>(
			session,
			"post",
			"rapports",
			`search/?skip=${(currentPageNb - 1) * resultsPerPage}&max=${resultsPerPage}`,
			searchParams,
			(res) => {
				setReports([...res.data])
				setIsLoading(false)
				reqController.current = undefined
			},
			undefined,
			reqController.current.signal
		)
	}, [searchParams, currentPageNb, session])

	// keep nav history up to date

	const { navHistory, setNavHistory } = useContext(Context)

	useEffect(() => {
		// build the query string from the latest search params
		// @ts-ignore
		const query = new URLSearchParams(searchParams).toString()
		// get rid of the last update we made to the nav history
		const newNavHistory = navHistory.slice(0, navHistory.length - 1)
		// replace it with the URL corresponding to the current search params
		setNavHistory([...newNavHistory, `/availability-ratio-reports/search?${query}`])
	}, [searchParams])

	// render

	return (
		<main id={styles.container}>
			<section className={styles.pageHeader}>
				<Link
					className={styles.goBackButton}
					href="/availability-ratio-reports/">
					<FontAwesomeIcon icon={faChevronLeft} />
				</Link>
				<div className={styles.illustrationContainer}>
					<Image
						className={styles.imageHover}
						quality={100}
						src={"/images/data-illustration.svg"}
						alt={"Données"}
						priority
						fill
						style={{
							objectFit: "contain",
							top: "auto"
						}}
					/>
				</div>
				<div className={styles.pageTitleContainer}>
					<div className={styles.pageTitle}>
						<h1>Rapports de taux de disponibilité</h1>
						<p>Historique des rapports de taux de disponibilités générés.</p>
					</div>
					<form
						className={styles.searchForm}
						onSubmit={(e) => e.preventDefault()}>
						<FieldContainer>
							<div className={styles.filterCheckboxContainer}>
								<FilterCheckBox
									value={checkedFilters.includes("date-debut")}
									onChange={() => toggleFilter("date-debut")}
								/>
								<Label htmlFor="date-debut">Période entre le</Label>
							</div>
							<DateInput
								name="date-debut"
								value={dateRange.startDate}
								onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
								strict={false}
							/>
						</FieldContainer>
						<FieldContainer>
							<div className={styles.filterCheckboxContainer}>
								<FilterCheckBox
									value={checkedFilters.includes("date-fin")}
									onChange={() => toggleFilter("date-fin")}
								/>
								<Label htmlFor="date-fin">et le</Label>
							</div>
							<DateInput
								name="date-fin"
								value={dateRange.endDate}
								onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
								strict={false}
							/>
						</FieldContainer>
						<FieldContainer>
							<Label htmlFor="groupes-expositions">Groupes d&apos;expositions</Label>
							<Select
								name="groupes-expositions"
								options={groupesExpositions.map((groupe) => ({ value: groupe, label: groupe }))}
								value={selectedGroupesExpositions}
								onChange={setSelectedGroupesExpositions}
								isMulti
								large
								bigPadding
							/>
						</FieldContainer>
					</form>
				</div>
			</section>
			<section className={styles.searchContainer}>
				{reports.length > 0 && !isLoading ? (
					<>
						<p className={styles.resultsCount}>
							{nbResults} résultat{reports.length != 1 ? "s" : ""} au total
						</p>
						<Pagination
							currentPageNb={currentPageNb}
							totalPagesNb={totalPagesNb}
							setPageNb={setCurrentPageNb}
						/>
						<ul className={styles.results}>
							{reports.map((report, i) => (
								<ReportCard
									key={`report-${i}`}
									report={report}
								/>
							))}
						</ul>
					</>
				) : // while loading
				// display a loading indicator
				isLoading ? (
					<div className={styles.loadingIndicatorContainer}>
						<LoadingIndicator />
						<h4>Chargement...</h4>
					</div>
				) : (
					// if there aren't any results
					// display the corresponding illustration
					// & a message for the user
					<div className={styles.noResultsMessageContainer}>
						<div className={styles.illustrationContainer}>
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
						<h1>Aucun résultat...</h1>
						<p>Ré-essayer en changeant les paramètres de recherche</p>
					</div>
				)}
			</section>
		</main>
	)
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
	// get initial search results by making a request to the API
	// start by parsing the URL query into an object
	// that contains valid search params for our API

	const [, searchParams] = parseURLQuery(context.query)

	console.log("search params", searchParams)

	// empty props in case there's an error

	const emptyProps: { props: Props } = {
		props: {
			initSearchParams: {},
			initReports: []
		}
	}

	// get the auth token from the session

	const session = (await getServerSession(context.req, context.res, authOptions)) as MySession | null

	if (!session) return emptyProps

	// make the API request

	const reports = await SSRmakeAPIRequest<RapportTauxDisponibilite[], RapportTauxDisponibilite[]>({
		session: session,
		verb: "post",
		itemType: "rapports",
		additionalPath: `search/?skip=0&max=${resultsPerPage}`, // get the first page of results
		data: searchParams,
		// the response is an array of reports
		onSuccess: (res) => res.data
	})

	// return the props

	return {
		props: {
			initSearchParams: searchParams,
			initReports: reports || []
		}
	}
}

export default Search
