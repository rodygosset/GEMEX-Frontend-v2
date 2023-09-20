import Button from "@components/button"
import SearchResultCard from "@components/cards/search-result-card"
import SearchBar from "@components/form-elements/search-bar"
import Pagination from "@components/pagination"
import SearchFilters from "@components/search-filters"
import LoadingIndicator from "@components/utils/loading-indicator"
import { searchConf, SearchResultsMetaData } from "@conf/api/search"
import { MySession } from "@conf/utility-types"
import { faDownload, faList, faTableCellsLarge } from "@fortawesome/free-solid-svg-icons"
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
import { getServerSession } from "next-auth"
import Head from "next/head"
import { useRouter } from "next/router"
import { useContext, useEffect, useRef, useState } from "react"
import { authOptions } from "./api/auth/[...nextauth]"

import Image from "next/image"
import { useSession } from "next-auth/react"
import { ScrollArea } from "@components/radix/scroll-area"
import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { capitalizeFirstLetter, toISO } from "@utils/general"
import { apiURLs } from "@conf/api/conf"
import { Skeleton } from "@components/radix/skeleton"

interface Props {
    queryItemType: string;
    initSearchParams: DynamicObject;
    results: any[];
    initMetaData: SearchResultsMetaData;
}

export const resultsPerPage = 30

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

    // load the search params from the URL query

    useEffect(() => {
        setSearchParams({
            ...initSearchParams,
            item: itemType
        })
    }, [])

    // make sure we don't update the search params object
    // until the default search params have been loaded

    const [initSearchParamsLoaded, setInitSearchParamsLoaded] = useState(false)

    useEffect(() => {
        if(!initSearchParamsLoaded &&
            JSON.stringify(searchParams) == JSON.stringify({ ...initSearchParams, item: queryItemType })) {
                setInitSearchParamsLoaded(true)
            }
    }, [searchParams])

    // search results


    const [searchResults, setSearchResults] = useState(results)
    
    // useEffect(() => console.log(searchResults), [searchResults])

    // when the item type changes, 
    // update the search params

    useEffect(() => {
        if(!initSearchParamsLoaded) return
        setSearchParams({
            ...searchParams,
            item: itemType
        })
    }, [itemType])

    useEffect(() => console.log(searchParams), [searchParams])

    // search results meta-data
    const [metaData, setMetaData] = useState(initMetaData)

    // when the search results change
    // fetch corresponding meta-data

    const session = useSession().data as MySession | null

    const getMetaData = useGetMetaData()

    useEffect(() => {
        if(!session) return

        getMetaData(session, itemType, searchResults).then(metaData => {
            if(metaData) setMetaData(metaData)
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
        if(!session) return

        // make a request to our API to get the number of search results
        // & divide that by the number of results per page 
        makeAPIRequest<{nb_results: number}, void>(
            session,
            "post", 
            itemType,
            "search/nb",
            searchParams,
            (res: AxiosResponse<{nb_results: number}>) => setNbResults(res.data.nb_results),
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

        if(!session) return

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

    // manage search filters visibility

    
    const [showFilters, setShowFilters] = useState(false)
    
    const toggleFiltersVisibilty = () => setShowFilters(!showFilters)


    // manage view mode (list or card)

    const [isListView, setIsListView] = useState<boolean>(true)

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
        // push the current url to the nav history
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

    // generate a CSV file from the search results

    const [csv, setCSV] = useState("")

    const searchResultsToCSV = async () => {
        if(!session) return
        // get the label for each attribute
        const labels = Object.entries(searchConf[itemType].searchParams).map(([key, value]) => capitalizeFirstLetter(value.label ?? key))
        // start building the CSV string
        let csv = "data:text/csv;charset=utf-8,"
        csv += labels.join(",") + "\n"
        // now insert each row into the CSV string
        console.log("row 1 ->", searchResults[0])
        console.log("row 2 ->", searchResults[1])
        for(const result of searchResults) {
            // for each attribute
            const row = await Promise.all(Object.entries(result)
            // filter out attributes that are not part of the search conf
            .filter(([key]) => searchConf[itemType].searchParams.hasOwnProperty(key))
            // sort by key to make sure the order is the same for each row
            // in the order that the attributes are defined in the search conf
            .sort(([key1], [key2]) => {
                const key1Pos = Object.keys(searchConf[itemType].searchParams).indexOf(key1)
                const key2Pos = Object.keys(searchConf[itemType].searchParams).indexOf(key2)
                return key1Pos - key2Pos
            })
            .map(async ([key, value]) => {
                // if the attribute is a date, convert it to ISO format
                if(searchConf[itemType].searchParams[key].type == "date") {
                    return toISO(new Date(value as string))
                } 
                // if the attribute is a boolean, convert it to "Oui" or "Non"
                else if(searchConf[itemType].searchParams[key].type == "boolean") {
                    return value ? "Oui" : "Non"
                } 
                // if the attribute is a list of items, join them with a comma & escape the list
                else if(searchConf[itemType].searchParams[key].type == "itemList") {
                    return `"${(value as any[]).join(", ")}"`
                } 
                // if the attribute is part of the meta-data, get the display value from the meta-data
                else if(metaData.hasOwnProperty(key)) {
                    const index = metaData[key].ids.indexOf(value as number)
                    return metaData[key].values[index]
                } 
                // if the attribute is an id referring to another item, get the display value from the API
                else if(apiURLs.hasOwnProperty(searchConf[itemType].searchParams[key].type)) {
                    return await makeAPIRequest<any, string>(
                        session,
                        "get",
                        searchConf[itemType].searchParams[key].type,
                        `id/${value}`,
                        undefined,
                        res => res.data.prenom ? `${res.data.prenom} ${res.data.nom}` : res.data.nom ?? res.data.titre ?? value
                    )

                } else return value ?? "Non rensigné"
            }))
            // escape \n & \r characters
            .then(row => row.map(value => value?.toString().replace(/(\r\n|\n|\r)/gm, " ")))
            csv += row.join(",") + "\n"
        }
        return encodeURI(csv)

    }

    useEffect(() => {
        searchResultsToCSV().then(csv => setCSV(csv ?? ""))
    }, [searchResults, metaData, itemType, session])

    // render

    return (
        <main id={styles.container}>
            <Head>
				<title>Recherche</title>
				<meta name="description" content="Page de recherche de GEMEX" />
			</Head>
            {
                // don't load the search filters
                // until the default search params have been loaded
                // to make sure they are not ignored
                initSearchParamsLoaded ?
                <SearchFilters 
                    hidden={!showFilters} 
                    onSubmit={handleFormSubmit}
                />
                :
                <></>
            }

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
                            <div className={styles.buttonsContainer}>
                                <Pagination
                                    currentPageNb={currentPageNb}
                                    totalPagesNb={totalPagesNb}
                                    setPageNb={setCurrentPageNb}
                                />
                                {/* <div className={styles.viewModeContainer}>
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
                                </div> */}
                                {
                                    csv ?
                                    <Link 
                                        download={`resultats-recherche-${itemType}-${new Date().toLocaleDateString("fr-fr")}.csv`}
                                        href={csv}
                                        className="text-sm text-primary bg-primary/10 flex items-center gap-4 px-[16px] py-[8px] rounded-[8px] 
                                    hover:bg-primary/20 transition-colors duration-300 ease-in-out">
                                        <FontAwesomeIcon icon={faDownload} />
                                        Export Excel
                                    </Link>
                                    : 
                                    <Skeleton className="w-[150px] h-[40px]" />
                                }
                            </div>
                            <ScrollArea className={styles.scrollContainer}>
                                <ul 
                                    id={styles.searchResults} 
                                    className={getResultsContainerClassNames()}>
                                {
                                    searchResults.map((item, index) => {
                                        return (
                                            <SearchResultCard
                                                key={`${itemType}-${index}-search-result-card`}
                                                itemType={itemType}
                                                data={item}
                                                globalMetaData={metaData}
                                                listView={isListView}
                                            />
                                        )
                                    })
                                }
                                </ul>
                            </ScrollArea>
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

    const session = (await getServerSession(context.req, context.res, authOptions)) as MySession | null

    if(session == null) return emptyProps

    // make the request to the API

    const results = await SSRmakeAPIRequest<any[], any[]>({
        session: session,
        verb: "post",
        itemType: itemType,
        additionalPath: `search/?skip=0&max=${resultsPerPage}`, // get page 1
        data: searchParams,
        onSuccess: res => res.data
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