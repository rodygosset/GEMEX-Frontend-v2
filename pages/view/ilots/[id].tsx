import { Ilot } from "@conf/api/data-types/ilot"
import { MySession } from "@conf/utility-types"
import { getExtraSSRData, isAuthError } from "@utils/req-utils"
import SSRmakeAPIRequest from "@utils/ssr-make-api-request"
import axios from "axios"
import { GetServerSideProps, NextPage } from "next"
import { unstable_getServerSession } from "next-auth"
import Head from "next/head"
import { authOptions } from "pages/api/auth/[...nextauth]"
import ViewTemplate from "pages/page-templates/view-template"


// this page displays information about a given Ilot object
// the data is retrieved in getServerSideProps

const itemType = "ilots"

interface Props {
    data: Ilot | null;
    extra: {
        localisation: string;
    } | null;
}



const ViewIlot: NextPage<Props> = (
    {
        data,
        extra
    }
) => {

    // useEffect(() => console.log(data), [])

    // render

    return (
        data ?
        <>
            <Head>
				<title>{data.nom} (Ilôt)</title>
				<meta name="description" content={`Informations sur l'ilôt ${data.nom}`} />
			</Head>
            <ViewTemplate
                itemType={itemType}
                itemTitle={data.nom}
                itemData={data}
                extraData={extra}
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

    const ilotId = context.query.id

    // retrieve the session, containing the user's auth token

    const session = await unstable_getServerSession(context.req, context.res, authOptions)

    // return empty props if we don't have an auth token
    // because if means we have no way to retrieve the data

    if(session == null) return { props: { data: null, extra: null } }

    // make the API request

    let is404 = false
    let is401 = false

    const data = await SSRmakeAPIRequest<Ilot, Ilot>({
        session: session as MySession,
        verb: "get",
        itemType: itemType,
        additionalPath: `id/${ilotId}`, 
        onSuccess: res => res.data,
        onFailure: error => {
            if(isAuthError(error)) is401 = true
            else if(axios.isAxiosError(error) && error.response?.status == 404) {
                is404 = true
            }
        }
    })


    if(is401) return { props: { data: null, extra: null } }

    // in case the provided ilot_id doesn't exist in the database

    else if(is404) return { notFound: true } // show the 404 page

    // retrieving the extra data we need to display

    const localisation = await getExtraSSRData(
        session as MySession, 
        "localisations_ilots", 
        (data as Ilot).localisation_id
    ) 

    // if everything went well
    // return the data as Props

    return {
        props: {
            data: data ? data : null,
            extra: {
                localisation: localisation ? localisation : "Erreur",
            }
        }
    }

}

export default ViewIlot