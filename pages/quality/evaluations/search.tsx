import ItemMultiSelect from "@components/form-elements/multi-select";
import { Form, FormField } from "@components/radix/form";
import { Skeleton } from "@components/radix/skeleton";
import { Evaluation } from "@conf/api/data-types/quality-module";
import { MySession } from "@conf/utility-types";
import { faChevronLeft, faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import SSRmakeAPIRequest from "@utils/ssr-make-api-request";
import { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";


interface EvaluationSearchParams {
    thematiques: number[];
    expositions: number[];
}

interface Props {
    initSearchParams: EvaluationSearchParams;
    initSearchResults: Evaluation[];
}


const searchFormSchema = z.object({
    thematiques: z.array(z.number()),
    expositions: z.array(z.number())
})

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

    // submit handler

    const handleSubit = async (data: z.infer<typeof searchFormSchema>) => {
        // todo 
    }

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
                        onSubmit={searchForm.handleSubmit(handleSubit)}
                        className="flex items-center flex-wrap gap-[16px]">
                        <FormField
                            control={searchForm.control}
                            name="thematiques"
                            render={({ field }) => (
                                <></>
                                // todo
                            )}
                        />

                    </form>
                </Form>
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

    const initSearchResults = (await SSRmakeAPIRequest<Evaluation[], Evaluation[]>({
        session,
        verb: "post",
        itemType: "evaluations",
        additionalPath: "search",
        data: {
            thematiques,
            expositions
        },
        onSuccess: res => res.data
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