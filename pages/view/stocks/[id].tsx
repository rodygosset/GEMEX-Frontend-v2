import { Stock } from "@conf/api/data-types/stock"
import { MySession } from "@conf/utility-types"
import SSRmakeAPIRequest from "@utils/ssr-make-api-request"
import axios from "axios"
import { GetServerSideProps, NextPage } from "next"
import { unstable_getServerSession } from "next-auth"
import Head from "next/head"
import { authOptions } from "pages/api/auth/[...nextauth]"
import ViewTemplate from "pages/page-templates/view-template"


// this page displays information about a given Stock object
// the data is retrieved in getServerSideProps

const itemType = "stocks"

interface Props {
    data: Stock | null;
}



const ViewStock: NextPage<Props> = (
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
				<title>{data.nom} (Stock)</title>
				<meta name="description" content={`Informations sur le stock ${data.nom}`} />
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

    const stockId = context.query.id

    // retrieve the session, containing the user's auth token

    const session = (await unstable_getServerSession(context.req, context.res, authOptions)) as MySession | null

    // return empty props if we don't have an auth token
    // because if means we have no way to retrieve the data

    if(session == null) return { props: { data: null } }

    // make the API request

    let is404 = false
    let isError = false

    const data = await SSRmakeAPIRequest<Stock, Stock>({
        session: session,
        verb: "get",
        itemType: itemType,
        additionalPath: `id/${stockId}`, 
        onSuccess: res => res.data,
        onFailure: error => {
            if(axios.isAxiosError(error) && error.response?.status == 404) {
                is404 = true
            } else {
                isError = true
            }
        }
    })

    if(isError) return { props: { data: null } }

    // in case the provided stock_id doesn't exist in the database

    if(is404) return { notFound: true } // show the 404 page

    // if everything went well
    // return the data as Props

    return {
        props: {
            data: data ? data : null
        }
    }

}

export default ViewStock