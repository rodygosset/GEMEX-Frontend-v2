import GoBackButton from "@components/go-back-button"
import { Element } from "@conf/api/data-types/element"
import { MySession } from "@conf/utility-types"
import SSRmakeAPIRequest from "@utils/ssr-make-api-request"
import axios from "axios"
import { GetServerSideProps, NextPage } from "next"
import { unstable_getServerSession } from "next-auth"
import Head from "next/head"
import { authOptions } from "pages/api/auth/[...nextauth]"
import ViewTemplate from "pages/page-templates/view-template"
import { useEffect } from "react"


// this page displays information about a given Exposition object
// the data is retrieved in getServerSideProps

const itemType = "elements"

interface Props {
    data: Element | null;
}



const ViewElements: NextPage<Props> = (
    {
        data
    }
) => {

    // useEffect(() => console.log(data), [])

    // render

    return (
        data ?
        <ViewTemplate>
            <Head>
				<title>{data.nom} (Element)</title>
				<meta name="description" content={`Informations sur l'élement d'exposition ${data.nom}`} />
			</Head>
            <GoBackButton/>
        </ViewTemplate>
        :
        // if we couldn't retrive the data
        // let the user know there was a problem
        <></>
    )
}


export const getServerSideProps: GetServerSideProps<Props> = async (context) => {

    // retrive the data about the expo by making a request to our backend API

    // start with getting the expo's DB id

    const elementId = context.query.id

    // retrieve the session, containing the user's auth token

    const session = await unstable_getServerSession(context.req, context.res, authOptions)

    // return empty props if we don't have an auth token
    // because if means we have no way to retrieve the data

    if(session == null) return { props: { data: null } }

    // make the API request

    let is404 = false

    const data = await SSRmakeAPIRequest<Element, Element>({
        session: session as MySession,
        verb: "get",
        itemType: itemType,
        additionalPath: `id/${elementId}`, 
        onSuccess: res => res.data,
        onFailure: error => {
            if(axios.isAxiosError(error) && error.response?.status == 404) {
                is404 = true
            }
        }
    })

    // in case the provided exposition_id doesn't exist in the database

    if(is404) return { notFound: true } // show the 404 page

    // if everything went well
    // return the data as Props

    return {
        props: {
            data: data ? data : null
        }
    }

}

export default ViewElements