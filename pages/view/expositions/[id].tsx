import { Exposition } from "@conf/api/data-types/exposition"
import { MySession } from "@conf/utility-types"
import { getExtraSSRData, isAuthError } from "@utils/req-utils"
import SSRmakeAPIRequest from "@utils/ssr-make-api-request"
import axios from "axios"
import { GetServerSideProps, NextPage } from "next"
import { unstable_getServerSession } from "next-auth"
import Head from "next/head"
import { authOptions } from "pages/api/auth/[...nextauth]"
import ViewTemplate from "pages/page-templates/view-template"


// this page displays information about a given Exposition object
// the data is retrieved in getServerSideProps

const itemType = "expositions"

interface Props {
    data: Exposition | null;
    extra: {
        regie: string;
    } | null;
}



const ViewExposition: NextPage<Props> = (
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
                <title>{data.nom} (Exposition)</title>
                <meta name="description" content={`Informations sur l'exposition ${data.nom}`} />
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

    // start with getting the expo's DB id

    const expoId = context.query.id

    // retrieve the session, containing the user's auth token

    const session = (await unstable_getServerSession(context.req, context.res, authOptions)) as MySession | null

    // return empty props if we don't have an auth token
    // because if means we have no way to retrieve the data

    if(session == null) return { props: { data: null, extra: null } }

    // make the API request

    let is404 = false
    let is401 = false
    let isError = false

    const data = await SSRmakeAPIRequest<Exposition, Exposition>({
        session: session,
        verb: "get",
        itemType: itemType,
        additionalPath: `id/${expoId}`, 
        onSuccess: res => res.data,
        onFailure: error => {
            if(isAuthError(error)) is401 = true
            else if(axios.isAxiosError(error) && error.response?.status == 404) {
                is404 = true
            } else {
                isError = true
            }
        }
    })

    if(is401 || isError) return { props: { data: null, extra: null } }

    // in case the provided exposition_id doesn't exist in the database

    else if(is404) return { notFound: true } // show the 404 page

    // retrieving the extra data we need to display

    const regie = await getExtraSSRData(
        session, 
        "regies", 
        (data as Exposition).regie_id
    )

    // if everything went well
    // return the data as Props

    return {
        props: {
            data: data ? data : null,
            extra: {
                regie: regie ? regie : "Erreur"
            }
        }
    }

}

export default ViewExposition