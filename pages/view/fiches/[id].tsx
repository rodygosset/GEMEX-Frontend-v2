import { Fiche, fichesViewConf } from "@conf/api/data-types/fiche"
import { MySession } from "@conf/utility-types"
import { getExtraSSRData, isAuthError } from "@utils/req-utils"
import SSRmakeAPIRequest from "@utils/ssr-make-api-request"
import axios from "axios"
import { GetServerSideProps, NextPage } from "next"
import { unstable_getServerSession } from "next-auth"
import Head from "next/head"
import { authOptions } from "pages/api/auth/[...nextauth]"
import ViewTemplate from "pages/page-templates/view-template"


// this page displays information about a given Fiche object
// the data is retrieved in getServerSideProps

const itemType = "fiches"

interface Props {
    data: Fiche | null;
    extra: {
        auteur: string;
        ilot: string;
        exposition: string;
        element: string;
        type: string;
        nature: string;
        user_en_charge: string;
        status: string;
    } | null;
}



const ViewFiche: NextPage<Props> = (
    {
        data,
        extra
    }
) => {

    // useEffect(() => console.log(data), [])

    // utils

    const getHiddenAttributes = () => {
        if(!data || data.tags.length == 0) return []
        const ficheType = data.tags[0].toLowerCase()
        return fichesViewConf[ficheType].excludedFields
    }

    // render

    return (
        data ?
        <>
            <Head>
				<title>{data.nom} (Fiche)</title>
				<meta name="description" content={`Informations sur la fiche ${data.nom}`} />
			</Head>
            <ViewTemplate
                itemType={itemType}
                itemTitle={data.nom}
                itemData={data}
                extraData={extra}
                hidden={getHiddenAttributes()}
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

    if(session == null) return { props: { data: null, extra: null } }

    // make the API request

    let is404 = false
    let is401 = false

    const data = await SSRmakeAPIRequest<Fiche, Fiche>({
        session: session as MySession,
        verb: "get",
        itemType: itemType,
        additionalPath: `id/${ficheId}`, 
        onSuccess: res => res.data,
        onFailure: error => {
            if(isAuthError(error)) is401 = true
            else if(axios.isAxiosError(error) && error.response?.status == 404) {
                is404 = true
            }
        }
    })


    if(is401) return { props: { data: null, extra: null } }

    // in case the provided fiche_id doesn't exist in the database

    else if(is404) return { notFound: true } // show the 404 page

    // retrieving the extra data we need to display

    const auteur = await getExtraSSRData(
        session as MySession, 
        "users", 
        (data as Fiche).auteur_id
    )

    const ilot = data?.ilot_id ? await getExtraSSRData(
        session as MySession, 
        "ilots", 
        (data as Fiche).ilot_id
    ) : null

    const exposition = data?.exposition_id ? await getExtraSSRData(
        session as MySession, 
        "expositions", 
        (data as Fiche).exposition_id
    ) : null

    const element = data?.element_id ? await getExtraSSRData(
        session as MySession, 
        "elements", 
        (data as Fiche).element_id
    ) : null

    const type = await getExtraSSRData(
        session as MySession, 
        "types_operations", 
        (data as Fiche).type_id
    ) 

    const nature = await getExtraSSRData(
        session as MySession, 
        "natures_operations", 
        (data as Fiche).nature_id
    )

    const user_en_charge = await getExtraSSRData(
        session as MySession, 
        "users", 
        (data as Fiche).user_en_charge_id
    )

    const fiche_status = await getExtraSSRData(
        session as MySession, 
        "fiches_status", 
        (data as Fiche).status_id
    )

    // if everything went well
    // return the data as Props

    return {
        props: {
            data: data ? data : null,
            extra: {
                auteur: auteur ? auteur : "Erreur",
                ilot: ilot ? ilot : "Erreur",
                exposition: exposition ? exposition : "Erreur",
                element: element ? element : "Erreur",
                type: type ? type : "Erreur",
                nature: nature ? nature : "Erreur",
                user_en_charge: user_en_charge ? user_en_charge: "Erreur",
                status: fiche_status ? fiche_status : "Erreur",
            }
        }
    }

}

export default ViewFiche