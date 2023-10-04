import OperationReportCard from "@components/cards/operation-report-card";
import { Fiche } from "@conf/api/data-types/fiche";
import { MySession } from "@conf/utility-types";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SSRmakeAPIRequest from "@utils/ssr-make-api-request";
import { cn } from "@utils/tailwind";
import { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";
import Image from "next/image";
import OperationReportsChartCard from "@components/cards/operation-reports-chart-card";

interface Props {
    fiches: Fiche[];
}

const Home: NextPage<Props> = (
    {
        fiches
    }: Props
) => {

    useEffect(() => {

        console.log("fiches : ", fiches)

    }, [fiches])


    // render

    return (
        <main className="flex flex-col px-[7%] gap-[32px] pt-[32px]">
            <section className="w-full flex flex-col gap-[16px]">
                <div className="flex flex-col">
                    <h3 className="text-2xl font-semibold text-blue-600">En cours</h3>
                    <span className="text-base font-normal text-blue-600/60">Fiches en cours de traitement dont vous êtes en charge</span>
                </div>
                <div className="w-screen overflow-x-scroll pl-[7%] py-[32px] ml-[-7%] no-scrollbar">
                    <ul className="w-full flex items-center gap-[16px]">
                    {
                        fiches.length > 0 ?
                            fiches.map(fiche => (
                                <li key={fiche.id}>
                                    <OperationReportCard fiche={fiche} />
                                </li>
                            ))
                        :
                            <li className={cn(
                                "w-[320px] min-w-[320px] h-[200px]  rounded-[8px]",
                                "flex flex-col items-center justify-center gap-[16px]",
                                "border-dashed border-2 border-blue-600/20",
                            )}>
                                <div className="h-[120px] w-full relative aspect-[1.226]">
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
                                <span className="text-blue-600/80 text-sm font-normal text-center">Aucune fiche en cours</span>
                            </li>
                    }
                    <li>
                        <Link
                            href="/create/fiches" 
                            className={cn(
                                "w-[320px] h-[200px]  rounded-[8px]",
                                "flex flex-col items-center justify-center gap-[16px]",
                                "border-dashed border-2 border-blue-600/20",
                                "text-base text-blue-600",
                                "hover:bg-blue-600/5 transition-all duration-300 ease-in-out"
                            )}>
                            <FontAwesomeIcon icon={faPlus} />
                            <span className="text-sm font-normal text-blue-600/60">Créer une fiche</span>
                        </Link>
                    </li>
                    </ul>
                </div>
            </section>
            <section className="w-full flex flex-col gap-[16px]">
                <div className="flex flex-col">
                    <h3 className="text-2xl font-semibold text-blue-600">Données</h3>
                    <span className="text-base font-normal text-blue-600/60">Informations utiles sur les opérations en cours</span>
                </div>
                <div className="w-full flex flex-wrap gap-[16px]">
                        <OperationReportsChartCard />
                </div>
            </section>
        </main>
    )

}


// get server side props

export const getServerSideProps: GetServerSideProps<Props> = async ctx => {

    // start by getting the user's session

    const session = (await getSession(ctx)) as MySession | null

    if(!session) return { props: { fiches: [] } }

    // get the user's ongoing operation reports from the API

    const fiches = await SSRmakeAPIRequest<Fiche[], Fiche[]>({
        session,
        verb: "post",
        itemType: "fiches",
        additionalPath: "search/",
        data: {
            is_active: true,
            user_en_charge_id: session.user.id,
            status_id: 2 // en cours
        },
        onSuccess: res => res.data
    })

    // return the props

    return {
        props: {
            fiches: fiches ?? []
        }
    }
}

export default Home