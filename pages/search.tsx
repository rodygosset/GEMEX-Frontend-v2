import SearchBar from "@components/form-elements/search-bar"
import SearchFilters from "@components/search-filters"
import { searchConf, SearchResultsMetaData } from "@conf/api/search"
import { MySession } from "@conf/utility-types"
import useAPIRequest from "@hook/useAPIRequest"
import { useGetSearchResultsMetaData } from "@hook/useGetSearchResultsMetaData"
import styles from "@styles/pages/search.module.scss"
import { Context } from "@utils/context"
import { parseURLQuery } from "@utils/search-utils"
import SSRmakeAPIRequest from "@utils/ssr-make-api-request"
import { DynamicObject } from "@utils/types"
import { AxiosResponse } from "axios"
import { GetServerSideProps, NextPage } from "next"
import { unstable_getServerSession } from "next-auth"
import Head from "next/head"
import { useRouter } from "next/router"
import { useContext, useEffect, useRef, useState } from "react"
import { authOptions } from "./api/auth/[...nextauth]"

interface Props {
    queryItemType: string;
    initSearchParams: DynamicObject;
    results: any[];
}

const resultsPerPage = 30

const Search: NextPage<Props> = ({ queryItemType, initSearchParams, results }) => {

    const router = useRouter()

    // we use the context API to store search parameters
    // so they can be shared between components,
    // like the SearchFilters component & this page

    // important to note: 
    // searchParams represents the filtered url query
    // that we get from the router
    // this is the object we pass to our backend API in our search request
    // searchParams is NOT the object representing the state of the SearchFilters component

    const { searchParams, setSearchParams } = useContext(Context)

    // state 

    const [itemType, setItemType] = useState(queryItemType)

    const [searchResults, setSearchResults] = useState(results)
    
    useEffect(() => console.log(searchResults), [searchResults])

    // when the item type changes, 
    // update the search params

    useEffect(() => setSearchParams({
        ...searchParams,
        item: itemType
    }), [itemType])

    useEffect(() => console.log(searchParams), [searchParams])

    // search results meta-data
    const [metaData, setMetaData] = useState<SearchResultsMetaData>()

    // when the search results change
    // fetch corresponding meta-data

    const getMetaData = useGetSearchResultsMetaData()

    useEffect(() => {
        getMetaData(itemType, searchResults).then(metaData => setMetaData(metaData))
    }, [searchResults])

    useEffect(() => console.log(metaData), [metaData])


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
    const [totalPagesNb, setTotalPagesNb] = useState(1)


    // on each search request, compute the total number of pages

    const getTotalPagesNb = () => {
        // make a request to our API to get the number of search results
        // & divide that by the number of results per page 
        makeAPIRequest<{nb_results: number}, void>(
            "post", 
            itemType,
            "search/nb",
            searchParams,
            (res: AxiosResponse<{nb_results: number}>) => setTotalPagesNb(Math.ceil(res.data.nb_results / resultsPerPage)),
            undefined
        )
    }

    useEffect(getTotalPagesNb, [searchResults])

    // go back to the first page
    // when the search parameters or the search item change
    
    useEffect(() => {
        setCurrentPageNb(1)
        getTotalPagesNb()
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


    // utils

    const getDefaultSearchParam = () => searchConf[itemType].defaultSearchParam

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
        router.push({
            pathname: '/search',
            query: searchParams
        })
    }

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

            <div id={styles.searchResultsContainer}> 
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
                <section id={styles.searchResultsContainer}>
                    hello
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

    // retrieve the session, with the user's auth token

    const session = await unstable_getServerSession(context.req, context.res, authOptions)

    // make the request to the API

    const results = await SSRmakeAPIRequest<any[], any[]>({
        session: session as MySession,
        verb: "post",
        itemType: itemType,
        additionalPath: `search/?skip=0&max=${resultsPerPage}`, // get page 1
        data: searchParams,
        onSuccess: res => res.data,
    })

    // pass the result as props

    return {
        props: {
            queryItemType: itemType,
            initSearchParams: searchParams,
            results: results ? results : []
        }
    }
}

export default Search