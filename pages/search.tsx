import Button from "@components/button"
import SearchResultCard from "@components/cards/search-result-card"
import SearchBar from "@components/form-elements/search-bar"
import Pagination from "@components/pagination"
import SearchFilters from "@components/search-filters"
import LoadingIndicator from "@components/utils/loading-indicator"
import VerticalScrollBar from "@components/utils/vertical-scrollbar"
import { searchConf, SearchResultsMetaData } from "@conf/api/search"
import { MySession } from "@conf/utility-types"
import { faList, faTableCellsLarge } from "@fortawesome/free-solid-svg-icons"
import useAPIRequest from "@hook/useAPIRequest"
import { useGetMetaData } from "@hook/useGetMetaData"
import styles from "@styles/pages/search.module.scss"
import { Context } from "@utils/context"
import { parseURLQuery } from "@utils/search-utils"
import { SSRGetMetaData } from "@utils/ssr-get-metadata"
import SSRmakeAPIRequest from "@utils/ssr-make-api-request"
import { DynamicObject } from "@utils/types"
import { AxiosResponse } from "axios"
import { GetServerSideProps, NextPage } from "next"
import { unstable_getServerSession } from "next-auth"
import Head from "next/head"
import { useRouter } from "next/router"
import { useContext, useEffect, useRef, useState } from "react"
import { authOptions } from "./api/auth/[...nextauth]"

import Image from "next/image"

interface Props {
    queryItemType: string;
    initSearchParams: DynamicObject;
    results: any[];
    initMetaData: SearchResultsMetaData;
}

const resultsPerPage = 30

const Search: NextPage<Props> = ({ queryItemType, initSearchParams, results, initMetaData }) => {

    const router = useRouter()

    // we use the context API to store search parameters
    // so they can be shared between components,
    // like the SearchFilters component & this page

    // important to note: 
    // searchParams represents the filtered url query
    // that we get from the router
    // this is the object we pass to our backend API in our search request
    // searchParams is NOT the object representing the state of the SearchFilters component

    const {
        searchParams, 
        setSearchParams, 
        navHistory, 
        setNavHistory
    } = useContext(Context)

    // state 

    const [itemType, setItemType] = useState(queryItemType)

    const [searchResults, setSearchResults] = useState(results)
    
    // useEffect(() => console.log(searchResults), [searchResults])

    // when the item type changes, 
    // update the search params

    useEffect(() => setSearchParams({
        ...searchParams,
        item: itemType
    }), [itemType])

    // useEffect(() => console.log(searchParams), [searchParams])

    // search results meta-data
    const [metaData, setMetaData] = useState(initMetaData)

    // when the search results change
    // fetch corresponding meta-data

    const getMetaData = useGetMetaData()

    useEffect(() => {
        getMetaData(itemType, searchResults).then(metaData => {
            if(metaData) setMetaData(metaData)
            else setMetaData({})
        })
    }, [searchResults])

    // useEffect(() => console.log(metaData), [metaData])


    // load the search params from the URL query

    useEffect(() => {
        setSearchParams({
            ...initSearchParams,
            item: itemType
        })
    }, [])

    // data fetching & pagination logic

    const makeAPIRequest = useAPIRequest()
    
    const [isLoading, setIsLoading] = useState(false)

    // we need to cancel on-going search requests
    // after a new one has been made
    // for that, we use the native AbortController

    const reqController = useRef<AbortController>()

    const [currentPageNb, setCurrentPageNb] = useState(1)
    const [nbResults, setNbResults] = useState(0)
    const [totalPagesNb, setTotalPagesNb] = useState(1)


    // on each search request, get the number of results
    // & compute the total number of pages

    const getNbResults = () => {
        // make a request to our API to get the number of search results
        // & divide that by the number of results per page 
        makeAPIRequest<{nb_results: number}, void>(
            "post", 
            itemType,
            "search/nb",
            searchParams,
            (res: AxiosResponse<{nb_results: number}>) => setNbResults(res.data.nb_results),
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

        // let the user know we're fetching data

        setIsLoading(true)

        // cancel previous request if it exists

        if(typeof reqController.current != "undefined") reqController.current.abort()

        // new abort controller for the new request we're going to make

        reqController.current = new AbortController()

        // make a request to our backend API

        const handleSuccess = (res: AxiosResponse<any[]>) => { // if our request succeeded
            // extract the data from the response object
            setSearchResults([...res.data])
            setIsLoading(false)
            reqController.current = undefined
        }

        makeAPIRequest<any[], void>(
            "post", 
            itemType,
            `search/?skip=${(currentPageNb - 1) * resultsPerPage}&max=${resultsPerPage}`,
            searchParams,
            handleSuccess,
            undefined,
            reqController.current.signal
        )

    }, [itemType, searchParams, currentPageNb])

    // manage search filters visibility

    
    const [showFilters, setShowFilters] = useState(true)
    
    const toggleFiltersVisibilty = () => setShowFilters(!showFilters)


    // manage view mode (list or card)

    const [isListView, setIsListView] = useState<boolean>(false)

    // utils

    const getDefaultSearchParam = () => searchConf[itemType].defaultSearchParam

    const getResultsContainerClassNames = () => {
        let classNames = ''
        classNames += isListView ? styles.listView : ''
        return classNames
    }

    // compute which view mode button should show as the current selected view mode
    // & return the corresponding CSS class

    const getViewModeButtonClassName = (isListViewButton: boolean) => {
        if(isListViewButton && isListView || !isListViewButton && !isListView) {
            return styles.selected
        }
        return ''
    }

    // handlers

    const handleItemTypeChange = (newItemType: string) => {
        setItemType(newItemType)
    }

    const handleSearchInputChange = (newInputValue: string) => {
        setSearchParams({
            ...searchParams,
            [getDefaultSearchParam()]: newInputValue
        })
    }

    const handleFormSubmit = () => {
        // before pushing to the new url
        // to get the search results
        // push to the current url to the nav history
        setNavHistory([...navHistory, router.asPath])
        // submit search query
        router.push({
            pathname: '/search',
            query: searchParams
        })
    }

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

    // render

    return (
        <main id={styles.container}>
            <Head>
				<title>Recherche</title>
				<meta name="description" content="Page de recherche de GEMEX" />
			</Head>
            <SearchFilters 
                hidden={!showFilters} 
                onSubmit={handleFormSubmit}
            />

            <div id={styles.mainColumn}> 
                <SearchBar
                    fullWidth
                    hideCTA
                    showFiltersButton
                    onFiltersToggle={toggleFiltersVisibilty}
                    defaultValue={ initSearchParams[getDefaultSearchParam()] }
                    itemType={itemType}
                    onItemTypeChange={handleItemTypeChange}
                    onInputChange={handleSearchInputChange}
                    onSubmit={handleFormSubmit}
                />
                <section>
                    { 
                        // don't display any content
                        // if there aren't no search results
                        searchResults.length > 0 && !isLoading ?
                        <>
                            <h3>Résultats de recherche ({ nbResults })</h3>
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
                            <VerticalScrollBar className={styles.scrollContainer}>
                                <ul 
                                    id={styles.searchResults} 
                                    className={getResultsContainerClassNames()}>
                                {
                                    searchResults.map(item => {
                                        return (
                                            <SearchResultCard
                                                key={item.nom}
                                                itemType={itemType}
                                                data={item}
                                                globalMetaData={metaData}
                                                listView={isListView}
                                            />
                                        )
                                    })
                                }
                                </ul>
                            </VerticalScrollBar>
                            <Pagination
                                currentPageNb={currentPageNb}
                                totalPagesNb={totalPagesNb}
                                setPageNb={setCurrentPageNb}
                            />
                        </>
                        :
                        // while loading
                        // display a loading indicator
                        isLoading ?
                        <div className={styles.loadingIndicatorContainer}>
                            <LoadingIndicator/>
                            <h4>Chargement...</h4>
                        </div>
                        :
                        // if there aren't any results
                        // display the corresponding illustration
                        // & a message for the user
                        <div className={styles.noResultsMessageContainer}>
                            <div className={styles.illustrationContainer}>
                                <Image 
                                    quality={100}
                                    src={'/images/no-results-illustration.svg'} 
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

                    }
                </section>
            </div>
        </main>
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

    const session = await unstable_getServerSession(context.req, context.res, authOptions)

    if(session == null) return emptyProps

    // make the request to the API

    const results = await SSRmakeAPIRequest<any[], any[]>({
        session: session as MySession,
        verb: "post",
        itemType: itemType,
        additionalPath: `search/?skip=0&max=${resultsPerPage}`, // get page 1
        data: searchParams,
        onSuccess: res => res.data
    })

    // get the meta-data for the search results

    const metaData = await SSRGetMetaData(itemType, results ? results : [], session as MySession)

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