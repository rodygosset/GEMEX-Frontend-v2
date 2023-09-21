import Pagination from "@components/pagination";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@components/radix/form";
import ItemMultiSelectCombobox from "@components/radix/item-multi-select-combobox";
import { Skeleton } from "@components/radix/skeleton";
import { Evaluation } from "@conf/api/data-types/quality-module";
import { MySession } from "@conf/utility-types";
import { faChevronLeft, faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAPIRequest from "@hook/useAPIRequest";
import { zodResolver } from "@hookform/resolvers/zod";
import SSRmakeAPIRequest from "@utils/ssr-make-api-request";
import { AxiosResponse } from "axios";
import { GetServerSideProps, NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";


interface EvaluationSearchParams {
    thematiques: number[];
    expositions: number[];
}

interface SearchResultsByMonth {
    mois_cycle_id: number;
    evaluations: Evaluation[];
}

interface Props {
    initSearchParams: EvaluationSearchParams;
    initSearchResults: SearchResultsByMonth[];
}


const searchFormSchema = z.object({
    thematiques: z.array(z.number()),
    expositions: z.array(z.number())
})

export const resultsPerPage = 30

const Search: NextPage<Props> = (
    {
        initSearchParams,
        initSearchResults
    }: Props
) => {

    // search form

    const searchForm = useForm<z.infer<typeof searchFormSchema>>({
        resolver: zodResolver(searchFormSchema),
        defaultValues: {
            thematiques: initSearchParams.thematiques,
            expositions: initSearchParams.expositions
        }
    })

    const searchParams = useWatch({
        control: searchForm.control
    })

    // utils

    const getSearchParams = () => {
        let params: any = {}
        if(searchParams.thematiques && searchParams.thematiques.length > 0) params.thematiques = searchParams.thematiques
        if(searchParams.expositions && searchParams.expositions.length > 0) params.expositions = searchParams.expositions
        return params
    }

    const [results, setResults] = useState(initSearchResults)

    // data fetching & pagination logic

    const makeAPIRequest = useAPIRequest()
    const session = useSession().data as MySession | null
    
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
            "evaluations",
            "search/nb",
            getSearchParams(),
            (res: AxiosResponse<{nb_results: number}>) => setNbResults(res.data.nb_results),
            () => console.log("search params => ", searchParams)
        )
    }

    useEffect(getNbResults, [results, session])

    useEffect(() => setTotalPagesNb(Math.ceil(nbResults / resultsPerPage)), [nbResults])

    // go back to the first page
    // when the search parameters or the search item change
    
    useEffect(() => {
        setCurrentPageNb(1)
        getNbResults()
    }, [searchParams])

    // fetch data on page change
    // & when the item type or the search params are updated

    const [refreshTrigger, setRefreshTrigger] = useState(false)

    const refresh = () => setRefreshTrigger(!refreshTrigger)

    useEffect(() => {

        if(!session) return

        // let the user know we're fetching data

        setIsLoading(true)

        // cancel previous request if it exists

        if(typeof reqController.current != "undefined") reqController.current.abort()

        // new abort controller for the new request we're going to make

        reqController.current = new AbortController()

        // make a request to our backend API

        makeAPIRequest<any[], void>(
            session,
            "post", 
            "evaluations",
            `search/?skip=${(currentPageNb - 1) * resultsPerPage}&max=${resultsPerPage}`,
            getSearchParams(),
            res => {
                // sort the results by month
                const resultsByMonth: SearchResultsByMonth[] = []
                res.data.forEach(evaluation => {
                    const monthId = evaluation.mois_cycle_id
                    const monthResults = resultsByMonth.find(result => result.mois_cycle_id === monthId)
                    if(monthResults) {
                        monthResults.evaluations.push(evaluation)
                    } else {
                        resultsByMonth.push({
                            mois_cycle_id: monthId,
                            evaluations: [evaluation]
                        })
                    }
                })
                console.log("resultsByMonth => ", resultsByMonth)
                setResults(resultsByMonth)
                setIsLoading(false)
                reqController.current = undefined
            },
            undefined,
            reqController.current.signal
        )

    }, [searchParams, currentPageNb, session, refreshTrigger])

    // excel export

    const [csv, setCSV] = useState("")

    // render

    return (
        <main className="flex flex-col px-[7%] gap-y-16 pt-6">
            <div className="w-full flex flex-row items-center gap-x-16 gap-y-[32px] flex-wrap">
                <Link
                    className="flex flex-row items-center justify-center w-[60px] h-[60px] rounded-full bg-primary/10
                        group hover:bg-primary hover:shadow-2xl hover:shadow-primary/40 transition duration-300 ease-in-out cursor-pointer
                    "
                    href="/quality">
                    <FontAwesomeIcon 
                        className="text-primary group-hover:text-white text-base transition duration-300 ease-in-out"
                        icon={faChevronLeft} 
                    />
                </Link>
                <div className="flex flex-col flex-1 min-w-[350px]">
                    <h1 className="text-2xl text-primary font-semibold h-fit whitespace-nowrap">Historique</h1>
                    <p className="text-base text-primary text-opacity-40">Passer en revue les évaluations passées en fonction des thématiques et des expositions</p>
                </div>
                {
                    !csv ?
                    <Link 
                        download={`resultats-recherche-historique-evaluation-${new Date().toLocaleDateString("fr-fr")}.csv`}
                        href={csv}
                        className="text-sm text-primary bg-primary/10 h-fit flex items-center gap-4 px-[16px] py-[8px] rounded-[8px] 
                    hover:bg-primary/20 transition-colors duration-300 ease-in-out">
                        <FontAwesomeIcon icon={faDownload} />
                        Export Excel
                    </Link>
                    : 
                    <Skeleton className="w-[150px] h-[40px]" />
                }
            </div>
            <div className="w-full flex items-center flex-wrap gap-[16px]">
                <Form {...searchForm}>
                    <form
                        onSubmit={searchForm.handleSubmit(refresh)}
                        className="w-full flex flex-wrap gap-[16px]">
                        <FormField
                            control={searchForm.control}
                            name="thematiques"
                            render={({ field }) => (
                                <FormItem className="flex-1 min-w-[250px]">
                                    <FormLabel>Thématiques</FormLabel>
                                    <FormControl>
                                        <ItemMultiSelectCombobox
                                            itemType="thematiques"
                                            selected={field.value}
                                            onSelect={options => searchForm.setValue(field.name, options.map(o => o.value as number))}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Sélectionnez les thématiques pour lesquelles vous souhaitez consulter les évaluations
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={searchForm.control}
                            name="expositions"
                            render={({field}) => (
                                <FormItem className="flex-1 min-w-[250px]">
                                    <FormLabel>Expositions</FormLabel>
                                    <FormControl>
                                        <ItemMultiSelectCombobox
                                            itemType="expositions"
                                            selected={field.value}
                                            onSelect={options => searchForm.setValue(field.name, options.map(o => o.value as number))}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Sélectionnez les expositions pour lesquelles vous souhaitez consulter les évaluations
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </div>
            {
                isLoading ?
                <Skeleton className="w-full h-[200px]" />
                :
                results.length > 0 ?
                results.map((result, index) => (
                    <div key={index} className="w-full flex flex-col gap-y-4">
                        <h2 className="text-xl text-primary font-semibold h-fit whitespace-nowrap">{ result.mois_cycle_id }</h2>
                    </div>
                ))
                :
                <p className="text-base text-primary text-opacity-40">Aucun résultat</p>
            }
            <div className="w-full flex items-center">
                <Pagination
                    currentPageNb={currentPageNb}
                    totalPagesNb={totalPagesNb}
                    setPageNb={setCurrentPageNb}
                />
            </div>
        </main>
    )
}


export const getServerSideProps: GetServerSideProps<Props> = async (context) => {

    const emptyProps: Props = {
        initSearchParams: {
            thematiques: [],
            expositions: []
        },
        initSearchResults: []
    }

    // get the session, so we can use it to make API calls

    const session = (await getSession(context)) as MySession | null

    if(!session) return { props: emptyProps }

    // extract the search params from the query

    let thematiques: number[] = [] 

    // convert the thematiques query param to an array of integers

    if(context.query.thematiques) {
        if(typeof context.query.thematiques === "string") {
            thematiques = [parseInt(context.query.thematiques)]
        } else {
            thematiques = context.query.thematiques.map(thematique => parseInt(thematique))
        }
    }

    let expositions: number[] = []

    // do the same for the expositions query param

    if(context.query.expositions) {
        if(typeof context.query.expositions === "string") {
            expositions = [parseInt(context.query.expositions)]
        } else {
            expositions = context.query.expositions.map(exposition => parseInt(exposition))
        }
    }

    // make the request to the API

    const initSearchResults = (await SSRmakeAPIRequest<Evaluation[], SearchResultsByMonth[]>({
        session,
        verb: "post",
        itemType: "evaluations",
        additionalPath: "search",
        data: {
            thematiques,
            expositions
        },
        onSuccess: res => {
            // sort the results by month
            const resultsByMonth: SearchResultsByMonth[] = []
            res.data.forEach(evaluation => {
                const monthId = evaluation.mois_cycle_id
                const monthResults = resultsByMonth.find(result => result.mois_cycle_id === monthId)
                if(monthResults) {
                    monthResults.evaluations.push(evaluation)
                } else {
                    resultsByMonth.push({
                        mois_cycle_id: monthId,
                        evaluations: [evaluation]
                    })
                }
            })
            return resultsByMonth
        }
    })) ?? []

    return {
        props: {
            initSearchParams: {
                thematiques,
                expositions
            },
            initSearchResults
        }
    }

}


export default Search