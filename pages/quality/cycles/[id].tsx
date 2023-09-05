import ExpositionsWidget from "@components/quality-module/widgets/cycle-page/expositions-widget";
import ChartWidget from "@components/quality-module/widgets/cycle-page/chart-widget";
import MonthlyAssessmentsWidget from "@components/quality-module/widgets/cycle-page/monthly-assessments-widget";
import ThematiquesWidget from "@components/quality-module/widgets/cycle-page/thematiques-widget";
import { Cycle } from "@conf/api/data-types/quality-module"
import { MySession } from "@conf/utility-types"
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SSRmakeAPIRequest from "@utils/ssr-make-api-request";
import { GetServerSideProps, NextPage } from "next"
import { getSession } from "next-auth/react"
import Link from "next/link";

interface Props {
    data: Cycle | null;
}

const CyclePage: NextPage<Props> = (
    {
        data
    }: Props
) => {

    // utils

    const getCycleYear = () => data ? new Date(data.date_debut).getFullYear() : null

    const getLocaleDateString = (date: string) => new Date(date).toLocaleDateString("fr-fr", { year: 'numeric', month: 'long', day: 'numeric' })

    // render

    return data ? (
        <main className="flex flex-col px-[7%] gap-y-16 pt-6">
            <div className="w-full flex flex-row gap-16 flex-wrap">
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
                <div className="flex flex-col flex-1">
                    <h1 className="text-2xl text-primary font-semibold h-fit whitespace-nowrap">{getCycleYear()}</h1>
                    <p className="text-base text-primary uppercase text-opacity-40 tracking-widest whitespace-nowrap">Cycle d'évaluation qualité</p>
                    <p className="text-sm text-primary">
                        Du {getLocaleDateString(data.date_debut)} au {getLocaleDateString(data.date_fin)}
                    </p>
                </div>
            </div>
            <div className="w-full flex flex-row gap-4 max-lg:flex-col-reverse">
                <div className="flex flex-col flex-1 flex-grow-[1.3] gap-4">
                    <MonthlyAssessmentsWidget cycle={data} />
                    <ExpositionsWidget cycle={data} />
                </div>
                <div className="min-w-0 flex flex-col gap-4 flex-1">
                    <ChartWidget cycle={data} />
                    <ThematiquesWidget cycle={data} />
                </div>
            </div>
        </main>
    ) : <></>

}


export const getServerSideProps: GetServerSideProps<Props> = async (context) => {

    const session = (await getSession(context)) as MySession | null

    if(!session) return { props: { data: null } }

    // start with getting the item's DB id

    const id = context.query.id

    // make a request to the api to get the cycle from the database

    const data = await SSRmakeAPIRequest<Cycle, Cycle>({
        session,
        verb: 'get',
        itemType: 'cycles',
        additionalPath: `id/${id}`,
        onSuccess: res => res.data
    })

    return {
        props: {
            data: data || null
        }
    }

}


export default CyclePage