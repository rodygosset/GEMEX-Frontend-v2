import SearchBar from "@components/form-elements/search-bar"
import SearchFilters from "@components/search-filters"
import { searchConf } from "@conf/api/search"
import { MySession } from "@conf/utility-types"
import styles from "@styles/pages/search.module.scss"
import { Context } from "@utils/context"
import { parseURLQuery } from "@utils/search-utils"
import SSRmakeAPIRequest from "@utils/ssr-make-api-request"
import { DynamicObject } from "@utils/types"
import { GetServerSideProps, NextPage } from "next"
import { unstable_getServerSession } from "next-auth"
import Head from "next/head"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"
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
    // this is the object we pass to the search request to our backend API
    // searchParams is NOT the object representing the state of the SearchFilters component

    const { searchParams, setSearchParams } = useContext(Context)

    // state 

    const [itemType, setItemType] = useState(queryItemType)

    const [searchResults, setSearchResults] = useState(results)

    // when the item type changes, 
    // update the search params

    useEffect(() => setSearchParams({
        ...searchParams,
        item: itemType
    }), [itemType])

    useEffect(() => console.log(searchParams), [searchParams])

    // load the search params from the URL query

    useEffect(() => {
        setSearchParams({
            ...initSearchParams,
            item: itemType
        })
    }, [])

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


    // todo => parse the URL query into a Filters object

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
            <form onSubmit={e => e.preventDefault()}> 
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
            </form>
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