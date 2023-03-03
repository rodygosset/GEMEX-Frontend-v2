import { FicheSystematique } from "@conf/api/data-types/fiche"
import { MySession } from "@conf/utility-types"
import { isAuthError } from "@utils/req-utils"
import SSRmakeAPIRequest from "@utils/ssr-make-api-request"
import axios from "axios"
import { GetServerSideProps, NextPage } from "next"
import { unstable_getServerSession } from "next-auth"
import { useSession } from "next-auth/react"
import Head from "next/head"
import { authOptions } from "pages/api/auth/[...nextauth]"
import My401Template from "pages/page-templates/401-template"
import EditTemplate from "pages/page-templates/edit-template"


// this page displays information about a given Fiche Systematique object
// the data is retrieved in getServerSideProps

const itemType = "fiches_systematiques"

interface Props {
    data: FicheSystematique | null;
}



const EditFicheSystematique: NextPage<Props> = (
    {
        data
    }
) => {

    
    const session = useSession()
    
    const user = (session.data as MySession | null)?.user
    const userRole = (session.data as MySession | null)?.userRole

    // utils
    
    // determine whether the user is authorized to edit the current item

    const userHasRequiredPermissions = () => userRole && userRole.permissions.includes("systematiques") ? true : false

    const userIsOwner = () => data && user && data.auteur_id == user.id ? true : false
    const userIsManager = () => userRole && userRole.permissions.includes("manage") ? true : false

    const userCanEditFiche = () => userHasRequiredPermissions() && (userIsOwner() || userIsManager())

    const getErrorMessage = () => `Vous n'avez pas les droits pour modifier la fiche systématique "${data?.nom}"`


    // render

    return (
        data && userCanEditFiche() ?
        <>
            <Head>
				<title>Modifier {data.nom} (Fiche Systématique)</title>
				<meta name="description" content={`Modifier la fiche systématique ${data.nom}`} />
			</Head>
            <EditTemplate
                itemType={itemType}
                defaultValues={data}
            />
        </>
        :
        data && !userCanEditFiche() ?
        <My401Template errorMessage={getErrorMessage()} />
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

    const session = (await unstable_getServerSession(context.req, context.res, authOptions)) as MySession | null 

    // return empty props if we don't have an auth token
    // because if means we have no way to retrieve the data

    if(session == null) return { props: { data: null } }

    // make the API request

    let is404 = false
    let is401 = false
    let isError = false

    const data = await SSRmakeAPIRequest<FicheSystematique, FicheSystematique>({
        session: session,
        verb: "get",
        itemType: itemType,
        additionalPath: `id/${ficheId}`, 
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


    if(is401 || isError) return { props: { data: null } }

    // in case the provided fiche_id doesn't exist in the database

    else if(is404) return { notFound: true } // show the 404 page


    // if everything went well
    // return the data as Props

    return {
        props: {
            data: data ? data : null
        }
    }

}

export default EditFicheSystematique