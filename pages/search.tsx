import SearchResultCard from "@components/cards/search-result-card"
import Pagination from "@components/pagination"
import LoadingIndicator from "@components/utils/loading-indicator"
import { itemTypes, searchConf, SearchResultsMetaData } from "@conf/api/search"
import { MySession } from "@conf/utility-types"
import { faDownload } from "@fortawesome/free-solid-svg-icons"
import useAPIRequest from "@hook/useAPIRequest"
import { useGetMetaData } from "@hook/useGetMetaData"
import { Context } from "@utils/context"
import { parseURLQuery } from "@utils/search-utils"
import { SSRGetMetaData } from "@utils/ssr-get-metadata"
import SSRmakeAPIRequest from "@utils/ssr-make-api-request"
import { DynamicObject } from "@utils/types"
import { AxiosResponse } from "axios"
import { GetServerSideProps, NextPage } from "next"
import { getServerSession } from "next-auth"
import Head from "next/head"
import { Fragment, useContext, useEffect, useRef, useState } from "react"
import { authOptions } from "./api/auth/[...nextauth]"

import Image from "next/image"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { capitalizeFirstLetter, toISO } from "@utils/general"
import { apiURLs } from "@conf/api/conf"
import { Skeleton } from "@components/radix/skeleton"
import { cn } from "@utils/tailwind"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@components/radix/dialog"
import { Button } from "@components/radix/button"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@components/radix/form"
import { Checkbox } from "@components/radix/checkbox"
import { ScrollArea } from "@components/radix/scroll-area"
import { Loader } from "lucide-react"

interface Props {
	queryItemType: string
	initSearchParams: DynamicObject
	results: any[]
	initMetaData: SearchResultsMetaData
}

export const resultsPerPage = 30

const Search: NextPage<Props> = ({ queryItemType, initSearchParams, results, initMetaData }) => {
	// we use the context API to store search parameters
	// so they can be shared between components,
	// like the SearchFilters component & this page

	// important to note:
	// searchParams represents the filtered url query
	// that we get from the router
	// this is the object we pass to our backend API in our search request
	// searchParams is NOT the object representing the state of the SearchFilters component

	const { searchParams, setSearchParams, navHistory, setNavHistory, initSearchParamsLoaded, setInitSearchParamsLoaded } = useContext(Context)

	const itemType = searchParams.item?.toString() ?? "fiches"

	// load the search params from the URL query

	useEffect(() => {
		console.log("setting search params to ", { ...initSearchParams, item: queryItemType })
		setSearchParams({ ...initSearchParams, item: queryItemType })
	}, [])

	useEffect(() => {
		console.log("search params are ", searchParams)
		if (!initSearchParamsLoaded && JSON.stringify(searchParams) == JSON.stringify({ ...initSearchParams, item: queryItemType })) {
			setInitSearchParamsLoaded(true)
		}
	}, [searchParams])

	// search results

	const [searchResults, setSearchResults] = useState(results)

	// useEffect(() => console.log(searchResults), [searchResults])

	// useEffect(() => console.log(searchParams), [searchParams])

	// search results meta-data
	const [metaData, setMetaData] = useState(initMetaData)

	// when the search results change
	// fetch corresponding meta-data

	const session = useSession().data as MySession | null

	const getMetaData = useGetMetaData()

	useEffect(() => {
		if (!session || !initSearchParamsLoaded) return

		getMetaData(session, itemType, searchResults).then((metaData) => {
			if (metaData) setMetaData(metaData)
			else setMetaData({})
		})
	}, [searchResults, session])

	// useEffect(() => console.log(metaData), [metaData])

	// data fetching & pagination logic

	const makeAPIRequest = useAPIRequest()

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
		if (!session || !initSearchParamsLoaded) return

		// make a request to our API to get the number of search results
		// & divide that by the number of results per page
		makeAPIRequest<{ nb_results: number }, void>(
			session,
			"post",
			itemType,
			"search/nb",
			searchParams,
			(res: AxiosResponse<{ nb_results: number }>) => setNbResults(res.data.nb_results),
			() => console.log("search params => ", searchParams)
		)
	}

	useEffect(getNbResults, [searchResults, session])

	useEffect(() => setTotalPagesNb(Math.ceil(nbResults / resultsPerPage)), [nbResults])

	// go back to the first page
	// when the search parameters or the search item change

	useEffect(() => {
		setCurrentPageNb(1)
		getNbResults()
	}, [itemType, searchParams])

	// fetch data on page change
	// & when the item type or the search params are updated

	useEffect(() => {
		if (!session || !initSearchParamsLoaded) return

		// let the user know we're fetching data

		setIsLoading(true)

		// cancel previous request if it exists

		if (typeof reqController.current != "undefined") reqController.current.abort()

		// new abort controller for the new request we're going to make

		reqController.current = new AbortController()

		// make a request to our backend API

		const handleSuccess = (res: AxiosResponse<any[]>) => {
			// if our request succeeded
			// extract the data from the response object
			setSearchResults([...res.data])
			setIsLoading(false)
			reqController.current = undefined
		}

		makeAPIRequest<any[], void>(
			session,
			"post",
			itemType,
			`search/?skip=${(currentPageNb - 1) * resultsPerPage}&max=${resultsPerPage}`,
			searchParams,
			handleSuccess,
			undefined,
			reqController.current.signal
		)
	}, [itemType, searchParams, currentPageNb, session])

	// utils

	// keep nav history up to date

	useEffect(() => {
		// build the query string from the latest search params
		// @ts-ignore
		const query = new URLSearchParams(searchParams).toString()
		// get rid of the last update we made to the nav history
		const newNavHistory = navHistory.slice(0, navHistory.length - 1)
		// replace it with the URL corresponding to the current search params
		setNavHistory([...newNavHistory, `/search?${query}`])
	}, [searchParams, itemType])

	// generate a CSV file from the search results

	const searchResultsToCSV = async (data: any[], selectedColumns: string[]) => {
		if (!session) return
		// get the label for each attribute
		const labels = Object.entries(searchConf[itemType].searchParams)
			.filter(([key]) => {
				if (!data.length) return true
				return Object.keys(data[0]).includes(key)
			})
			// filter out attributes that are not in the selected columns
			.filter(([key]) => selectedColumns.includes(key))
			// sort by key to make sure the order is the same for each row
			// in the order that the attributes are defined in the search conf
			.sort(([key1], [key2]) => {
				const key1Pos = Object.keys(searchConf[itemType].searchParams).indexOf(key1)
				const key2Pos = Object.keys(searchConf[itemType].searchParams).indexOf(key2)
				return key1Pos - key2Pos
			})
			.map(([key, value]) => capitalizeFirstLetter(value.label ?? key))
		// start building the CSV string
		let csv = "data:text/csv;charset=utf-8," + "\ufeff"
		csv += labels.join(";") + "\n"
		// now insert each row into the CSV string
		for (const result of data) {
			// for each attribute
			const row = await Promise.all(
				Object.entries(result)
					// filter out attributes that are not part of the search conf
					.filter(([key]) => searchConf[itemType].searchParams.hasOwnProperty(key))
					// filter out attributes that are not in the selected columns
					.filter(([key]) => selectedColumns.includes(key))
					// sort by key to make sure the order is the same for each row
					// in the order that the attributes are defined in the search conf
					.sort(([key1], [key2]) => {
						const key1Pos = Object.keys(searchConf[itemType].searchParams).indexOf(key1)
						const key2Pos = Object.keys(searchConf[itemType].searchParams).indexOf(key2)
						return key1Pos - key2Pos
					})
					.map(async ([key, value]) => {
						// if the attribute is a date, convert it to ISO format
						if (searchConf[itemType].searchParams[key].type == "date") {
							return value ? toISO(new Date(value as string)) : "Non rensigné"
						}
						// if the attribute is a boolean, convert it to "Oui" or "Non"
						else if (searchConf[itemType].searchParams[key].type == "boolean") {
							return value ? "Oui" : "Non"
						}
						// if the attribute is a list of items, join them with a comma & escape the list
						else if (searchConf[itemType].searchParams[key].type == "itemList") {
							return `"${(value as any[]).join(", ")}"`
						}
						// if the attribute is part of the meta-data, get the display value from the meta-data
						else if (metaData.hasOwnProperty(key)) {
							const index = metaData[key].ids.indexOf(value as number)
							return metaData[key].values[index]
						}
						// if the attribute is an id referring to another item, get the display value from the API
						else if (apiURLs.hasOwnProperty(searchConf[itemType].searchParams[key].type)) {
							return await makeAPIRequest<any, string>(
								session,
								"get",
								searchConf[itemType].searchParams[key].type,
								`id/${value}`,
								undefined,
								(res) => (res.data.prenom ? `${res.data.prenom} ${res.data.nom}` : res.data.nom ?? res.data.titre ?? value)
							)
						} else return value ?? "Non rensigné"
					})
			)
				// escape \n & \r characters
				.then((row) =>
					row.map(
						(value) =>
							`"${
								value
									?.toString()
									.replace(/(\r\n|\n|\r)/gm, " ")
									// escape double quotes
									.replace(/"/g, '""') ?? ""
							}"`
					)
				)
			csv += row.join(";") + "\n"
		}
		return encodeURI(csv)
	}

	const exportFormSchema = z.object({
		columns: z.array(z.string()).min(1)
	})

	const columnOptions = Object.keys(searchConf[itemType].searchParams).map((field) => ({
		label: searchConf[itemType].searchParams[field].label ?? capitalizeFirstLetter(field),
		value: field
	}))

	const exportForm = useForm<z.infer<typeof exportFormSchema>>({
		resolver: zodResolver(exportFormSchema),
		defaultValues: {
			columns: columnOptions.map((option) => option.value)
		}
	})

	const getAllSearchResults = async () => {
		if (!session) return

		const results = await SSRmakeAPIRequest<any[], any[]>({
			session: session,
			verb: "post",
			itemType: itemType,
			additionalPath: "search/",
			data: searchParams,
			onSuccess: (res) => res.data
		})

		if (!results) return

		return results
	}

	const handleExportFormSubmit = async (values: z.infer<typeof exportFormSchema>) => {
		console.log(values)

		const results = await getAllSearchResults()

		if (!results) return

		// get the CSV string

		const csv = await searchResultsToCSV(results, values.columns)

		if (!csv) return

		const fileName = `resultats-recherche-${itemType}-${new Date().toLocaleDateString("fr-fr")}.csv`

		// create a tag with download attribute={fileName} & href={csv}

		const link = document.createElement("a")
		link.download = fileName
		link.href = csv
		link.click()
	}

	// render

	return (
		<>
			<Head>
				<title>Recherche</title>
				<meta
					name="description"
					content="Page de recherche de GEMEX"
				/>
			</Head>
			{
				// don't display the controls if there aren't any results
				searchResults.length > 0 && !isLoading ? (
					<div
						className={cn(
							"w-full flex items-center justify-between gap-4 flex-wrap sticky top-[80px]",
							"border-b border-blue-600/10",
							"bg-neutral-50/40 backdrop-blur-3xl",
							"px-[2.5vw] py-4"
						)}>
						<Dialog>
							<DialogTrigger asChild>
								<Button
									variant="secondary"
									className="text-sm text-blue-600 bg-blue-600/10 flex items-center gap-4 px-4 py-[8px] rounded-[8px] 
                        hover:bg-blue-600/20 transition-colors duration-300 ease-in-out">
									<FontAwesomeIcon icon={faDownload} />
									Export Excel
								</Button>
							</DialogTrigger>
							<DialogContent className="p-10">
								<Form {...exportForm}>
									<form
										className="flex flex-col gap-4"
										onSubmit={exportForm.handleSubmit(handleExportFormSubmit)}>
										<DialogHeader>
											<DialogTitle>Export Excel</DialogTitle>
											<DialogDescription>Choississez les colonnes à inclure dans votre fichier Excel</DialogDescription>
										</DialogHeader>
										<FormField
											control={exportForm.control}
											name="columns"
											render={() => (
												<FormItem>
													{columnOptions.map((col) => (
														<FormField
															key={col.value}
															control={exportForm.control}
															name="columns"
															render={({ field }) => {
																return (
																	<ScrollArea className="max-h-[200px] w-full">
																		<FormItem
																			key={col.value}
																			className="flex flex-row items-start space-x-3 space-y-0">
																			<FormControl>
																				<Checkbox
																					checked={field.value?.includes(col.value)}
																					onCheckedChange={(checked) => {
																						return checked
																							? field.onChange([...field.value, col.value])
																							: field.onChange(
																									field.value?.filter((value) => value !== col.value)
																								)
																					}}
																				/>
																			</FormControl>
																			<FormLabel className="font-normal">{col.label}</FormLabel>
																		</FormItem>
																	</ScrollArea>
																)
															}}
														/>
													))}
													<FormMessage />
												</FormItem>
											)}
										/>
										<DialogFooter>
											<DialogClose asChild>
												<Button variant="outline">Annuler</Button>
											</DialogClose>
											<Button
												disabled={exportForm.formState.isSubmitting}
												type="submit">
												{exportForm.formState.isSubmitting ? (
													<Loader className="animate-spin text-sm" />
												) : (
													<FontAwesomeIcon icon={faDownload} />
												)}
												<span>Exporter</span>
											</Button>
										</DialogFooter>
									</form>
								</Form>
							</DialogContent>
						</Dialog>
						<Pagination
							currentPageNb={currentPageNb}
							totalPagesNb={totalPagesNb}
							setPageNb={setCurrentPageNb}
						/>
					</div>
				) : (
					<></>
				)
			}
			<main className="w-full h-full flex-1 flex flex-col gap-16 px-[7%] gap-y-[32px] pt-6">
				{
					// don't display any content
					// if there aren't no search results
					searchResults.length > 0 && !isLoading ? (
						<>
							<div className="w-full flex flex-col gap-[4px]">
								<h1 className="text-2xl font-semibold text-blue-600">Résultats de recherche</h1>
								<span className="text-base text-blue-600/60">
									{nbResults}{" "}
									{itemTypes.find((i) => i.value == itemType)
										? itemTypes.find((i) => i.value == itemType)?.label.toLowerCase()
										: "résultat(s)"}{" "}
									correspondant aux critères de recherche.
								</span>
							</div>
							<ul className={cn("rounded-[8px] flex flex-col w-full h-full", "border border-blue-600/10")}>
								{searchResults.map((item, index) => (
									<Fragment key={`${itemType}-${index}-search-result`}>
										<SearchResultCard
											itemType={itemType}
											data={item}
											globalMetaData={metaData}
										/>
										{index < searchResults.length - 1 ? <div className="w-full h-[1px] bg-blue-600/10" /> : <></>}
									</Fragment>
								))}
							</ul>
						</>
					) : // while loading
					// display a loading indicator
					isLoading ? (
						<div className="w-full h-full flex-1 flex flex-col justify-center items-center gap-[8px]">
							<LoadingIndicator />
							<span className="text-base text-blue-600 font-normal">Chargement...</span>
						</div>
					) : (
						// if there aren't any results
						// display the corresponding illustration
						// & a message for the user
						<div className="w-full h-full flex-1 flex flex-col justify-center items-center gap-4">
							<div className="w-full relative aspect-[1.226] max-w-[500px]">
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
							<div className="flex flex-col justify-center items-center text-center">
								<h1 className="text-blue-600 text-2xl">Aucun résultat...</h1>
								<p className="text-blue-600/60 text-base font-normal">Ré-essayer en changeant les paramètres de recherche</p>
							</div>
						</div>
					)
				}
			</main>
		</>
	)
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
	// get initial search results by making a request to the API
	// start by parsing the URL query into an object
	// that contains valid search params for our API

	const [itemType, searchParams] = parseURLQuery(context.query)

	// in case something goes wrong

	const emptyProps: { props: Props } = {
		props: {
			queryItemType: itemType,
			initSearchParams: searchParams,
			results: [],
			initMetaData: {}
		}
	}

	// retrieve the session, with the user's auth token

	const session = (await getServerSession(context.req, context.res, authOptions)) as MySession | null

	if (session == null) return emptyProps

	// make the request to the API

	const results = await SSRmakeAPIRequest<any[], any[]>({
		session: session,
		verb: "post",
		itemType: itemType,
		additionalPath: `search/?skip=0&max=${resultsPerPage}`, // get page 1
		data: searchParams,
		onSuccess: (res) => res.data
	})

	// get the meta-data for the search results

	const metaData = await SSRGetMetaData(itemType, results ? results : [], session)

	// pass the result as props

	return {
		props: {
			queryItemType: itemType,
			initSearchParams: searchParams,
			results: results ? results : [],
			initMetaData: metaData ? metaData : {}
		}
	}
}

export default Search
