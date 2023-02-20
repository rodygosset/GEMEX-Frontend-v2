import { FicheSystematique } from "@conf/api/data-types/fiche"
import { MySession } from "@conf/utility-types"
import SSRmakeAPIRequest from "@utils/ssr-make-api-request"
import axios from "axios"
import { GetServerSideProps, NextPage } from "next"
import { unstable_getServerSession } from "next-auth"
import Head from "next/head"
import { authOptions } from "pages/api/auth/[...nextauth]"
import ViewTemplate from "pages/page-templates/view-template"
import { useEffect } from "react"


// this page displays information about a given Fiche object
// the data is retrieved in getServerSideProps

const itemType = "fiches_systematiques"

interface Props {
    data: FicheSystematique | null;
}



const ViewFiche: NextPage<Props> = (
    {
        data
    }
) => {

    // useEffect(() => console.log(data), [])

    // render

    return (
        data ?
        <>
            <Head>
                <title>{data.nom} (Fiche Systématique)</title>
                <meta name="description" content={`Informations sur la fiche systématique ${data.nom}`} />
            </Head>
            
            <ViewTemplate
                itemType={itemType}
                itemTitle={data.nom}
                itemData={data}
            />
        </>
        :
        // if we couldn't retrive the data
        // let the user know there was a problem
        <></>
    )
}


export const getServerSideProps: GetServerSideProps<Props> = async (context) => {

    // retrive the data about the expo by making a request to our backend API

    // start with getting the item's DB id

    const ficheId = context.query.id

    // retrieve the session, containing the user's auth token

    const session = await unstable_getServerSession(context.req, context.res, authOptions)

    // return empty props if we don't have an auth token
    // because if means we have no way to retrieve the data

    if(session == null) return { props: { data: null } }

    // make the API request

    let is404 = false

    const data = await SSRmakeAPIRequest<FicheSystematique, FicheSystematique>({
        session: session as MySession,
        verb: "get",
        itemType: itemType,
        additionalPath: `id/${ficheId}`, 
        onSuccess: res => res.data,
        onFailure: error => {
            if(axios.isAxiosError(error) && error.response?.status == 404) {
                is404 = true
            }
        }
    })

    // in case the provided fiche_id doesn't exist in the database

    if(is404) return { notFound: true } // show the 404 page

    // if everything went well
    // return the data as Props

    return {
        props: {
            data: data ? data : null
        }
    }

}

export default ViewFiche