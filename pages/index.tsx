import OperationReportCard from "@components/cards/operation-report-card";
import { Fiche } from "@conf/api/data-types/fiche";
import { MySession } from "@conf/utility-types";
import SSRmakeAPIRequest from "@utils/ssr-make-api-request";
import { GetServerSideProps, NextPage } from "next";
import { getSession } from "next-auth/react";
import { useEffect } from "react";

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
                        fiches.map(fiche => (
                            <li key={fiche.id}>
                                <OperationReportCard fiche={fiche} />
                            </li>
                        ))
                    }
                    </ul>
                </div>
            </section>
            <section className="w-full flex flex-col gap-[16px]">
                <div className="flex flex-col">
                    <h3 className="text-2xl font-semibold text-blue-600">Données</h3>
                    <span className="text-base font-normal text-blue-600/60">Informations utiles sur les opérations en cours</span>
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
            fiches: fiches ? [fiches, fiches, fiches, fiches, fiches].flat() : []
        }
    }
}

export default Home