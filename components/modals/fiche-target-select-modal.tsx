import styles from "@styles/components/modals/fiche-target-select-modal.module.scss"
import Button from "@components/button"
import ModalContainer from "./modal-container"
import { useContext, useEffect, useRef, useState } from "react"
import SearchBar from "@components/form-elements/search-bar"
import { Context } from "@utils/context"
import { SearchResultsMetaData } from "@conf/api/search"
import { useGetMetaData } from "@hook/useGetMetaData"
import SearchFilters from "@components/search-filters"
import LoadingIndicator from "@components/utils/loading-indicator"
import Pagination from "@components/pagination"
import useAPIRequest from "@hook/useAPIRequest"
import { AxiosResponse } from "axios"
import { resultsPerPage } from "pages/search"
import SearchResultCard from "@components/cards/search-result-card"
import { faList, faTableCellsLarge } from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { MySession } from "@conf/utility-types"
import { ScrollArea } from "@components/radix/scroll-area"

interface Props {
	isVisible: boolean
	closeModal: () => void
	onSelect: (itemType: string, id: number) => void
}

// this modal is used to allow the user to choose an item
// which is either an expo or an element
// using the features fond on the search page
// it is used in the fiches creation & edit pages

const FicheTargetSelectModal = ({ isVisible, closeModal, onSelect }: Props) => {
	// state

	const [itemType, setItemType] = useState("elements")

	const hiddenItemTypes = ["fiches", "fiches_systematiques", "stocks", "articles", "constituents"]

	// clear the search params

	const { searchParams, setSearchParams } = useContext(Context)

	useEffect(() => setSearchParams({ item: itemType }), [])

	// make sure we don't update the search params object
	// until the default search params have been loaded

	const [initSearchParamsLoaded, setInitSearchParamsLoaded] = useState(false)

	useEffect(() => {
		if (!initSearchParamsLoaded && JSON.stringify(searchParams) == JSON.stringify({ item: itemType })) {
			setInitSearchParamsLoaded(true)
		}
	}, [searchParams])

	// when the item type changes,
	// update the search params

	useEffect(() => {
		if (!initSearchParamsLoaded) return
		setSearchParams({
			...searchParams,
			item: itemType
		})
	}, [itemType])

	// search results

	const [searchResults, setSearchResults] = useState<any[]>([])

	// search results meta-data

	const [metaData, setMetaData] = useState<SearchResultsMetaData>({})

	// when the search results change
	// fetch corresponding meta-data

	const getMetaData = useGetMetaData()

	const session = useSession().data as MySession | null

	useEffect(() => {
		if (!session) return
		getMetaData(session, itemType, searchResults).then((metaData) => {
			if (metaData) setMetaData(metaData)
			else setMetaData({})
		})
	}, [searchResults, session])

	// handlers

	const handleItemTypeChange = (newItemType: string) => {
		setItemType(newItemType)
	}

	const handleSearchInputChange = (newInputValue: string) => {
		setSearchParams({
			...searchParams,
			nom: newInputValue
		})
	}

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
		if (!session) return
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

	useEffect(getNbResults, [searchResults])

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
		if (!session) return

		// make sure nothing is selected when we reload the search results

		setSelectedItemId(0)

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

	// manage view mode (list or card)

	const [isListView, setIsListView] = useState<boolean>(true)

	// utils

	const getResultsContainerClassNames = () => {
		let classNames = ""
		classNames += isListView ? styles.listView : ""
		return classNames
	}

	// compute which view mode button should show as the current selected view mode
	// & return the corresponding CSS class

	const getViewModeButtonClassName = (isListViewButton: boolean) => {
		if ((isListViewButton && isListView) || (!isListViewButton && !isListView)) {
			return styles.selected
		}
		return ""
	}

	// manage card selection

	const [selectedItemId, setSelectedItemId] = useState<number>(0)

	const isSelected = (id: number) => selectedItemId == id

	const toggleIsSelected = (id: number) => (isSelected(id) ? setSelectedItemId(0) : setSelectedItemId(id))

	const handleSelect = () => {
		onSelect(itemType, selectedItemId)
		closeModal()
	}

	// render

	return (
		<ModalContainer isVisible={isVisible}>
			<div className={styles.modal}>
				{
					// don't load the search filters
					// until the default search params have been loaded
					// to make sure they are not ignored
					initSearchParamsLoaded ? (
						<SearchBar
							fullWidth
							hideCTA
							hiddenItemTypes={hiddenItemTypes}
							showFiltersButton
							embedFilters
							itemType={itemType}
							onItemTypeChange={handleItemTypeChange}
							onInputChange={handleSearchInputChange}
						/>
					) : (
						<></>
					)
				}
				<section>
					{
						// don't display any content
						// if there aren't no search results
						searchResults.length > 0 && !isLoading ? (
							<>
								<h3>Résultats de recherche ({nbResults})</h3>
								<div className={styles.buttonsContainer}>
									<Pagination
										currentPageNb={currentPageNb}
										totalPagesNb={totalPagesNb}
										setPageNb={setCurrentPageNb}
									/>
									<div className={styles.viewModeContainer}>
										<Button
											className={getViewModeButtonClassName(false)}
											icon={faTableCellsLarge}
											role="tertiary"
											bigPadding
											onClick={() => setIsListView(false)}>
											Cartes
										</Button>
										<Button
											className={getViewModeButtonClassName(true)}
											icon={faList}
											role="tertiary"
											bigPadding
											onClick={() => setIsListView(true)}>
											Liste
										</Button>
									</div>
								</div>
								<ScrollArea className={styles.scrollContainer}>
									<ul
										id={styles.searchResults}
										className={getResultsContainerClassNames()}>
										{searchResults.map((item) => {
											return (
												<SearchResultCard
													key={item.nom}
													itemType={itemType}
													data={item}
													globalMetaData={metaData}
													areLinksDisabled
													isSelected={isSelected(item.id)}
													onClick={() => toggleIsSelected(item.id)}
												/>
											)
										})}
									</ul>
								</ScrollArea>
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
						)
					}
				</section>
				<div className={styles.CTAContainer}>
					<Button
						role="secondary"
						animateOnHover={false}
						onClick={closeModal}>
						Annuler
					</Button>
					<Button
						active={selectedItemId != 0}
						onClick={handleSelect}>
						Sélectionner
					</Button>
				</div>
			</div>
		</ModalContainer>
	)
}

export default FicheTargetSelectModal
