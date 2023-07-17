import ResultsStep from "@components/availability-ratio-reports/results-step";
import GoBackButton from "@components/go-back-button";
import { RapportTauxDisponibilite } from "@conf/api/data-types/rapport";
import { MySession } from "@conf/utility-types";
import { isAuthError } from "@utils/req-utils";
import SSRmakeAPIRequest from "@utils/ssr-make-api-request";
import axios from "axios";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

import styles from "@styles/pages/availability-ratio-reports/view.module.scss"


interface Props {
    report?: RapportTauxDisponibilite;
}


const ViewAvailabilityRatioReport = (
    {
        report
    }: Props
) => {


    // render

    return report ? (
        <main id={styles.container}>
            <GoBackButton />
            <ResultsStep report={report} />
        </main>
    ) : <></>
}


export const getServerSideProps: GetServerSideProps<Props> = async (context) => {

    // retrieve the data from the api

    // start with getting the id from the url query

    const id = context.query.id

    // retrieve the session, containing the user's auth token

    const session = (await getServerSession(context.req, context.res, authOptions)) as MySession | null

    // return empty props if the user is not authenticated

    if(session == null) return { props: {} }

    // make the API request

    let is404 = false
    let is401 = false
    let isErr = false

    const data = await SSRmakeAPIRequest<RapportTauxDisponibilite, RapportTauxDisponibilite>({
        session: session,
        verb: "get",
        itemType: "rapports",
        additionalPath: `id/${id}`,
        onSuccess: res => res.data,
        onFailure: error => {
            if(isAuthError(error)) is401 = true
            else if(axios.isAxiosError(error) && error.response?.status == 404) {
                is404 = true
            } else {
                isErr = true
            }
        }
    })

    if(is401 || isErr) return { props: {} }

    // handle 404 errors

    else if(is404) return { notFound: true }

    // return the data

    return {
        props: {
            report: data ? data : undefined
        }
    }


}

export default ViewAvailabilityRatioReport