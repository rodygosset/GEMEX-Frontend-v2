import styles from "@styles/page-templates/view-template.module.scss"
import { Element } from "@conf/api/data-types/element"
import { MySession } from "@conf/utility-types"
import { getExtraSSRData, isAuthError } from "@utils/req-utils"
import SSRmakeAPIRequest from "@utils/ssr-make-api-request"
import axios from "axios"
import { GetServerSideProps, NextPage } from "next"
import { getServerSession } from "next-auth"
import Head from "next/head"
import { authOptions } from "pages/api/auth/[...nextauth]"
import ViewTemplate from "pages/page-templates/view-template"

// this page displays information about a given Exposition object
// the data is retrieved in getServerSideProps

const itemType = "elements"

interface Props {
	data: Element | null
	extra: {
		exposition: string
		etat: string
		exploitation: string
		localisation: string
	} | null
}

const ViewElements: NextPage<Props> = ({ data, extra }) => {
	// useEffect(() => console.log(data, extra), [])

	// in order to

	// render

	return data && extra ? (
		<>
			<Head>
				<title>{data.nom} (Element)</title>
				<meta
					name="description"
					content={`Informations sur l'élement d'exposition ${data.nom}`}
				/>
			</Head>

			<ViewTemplate
				itemType={itemType}
				itemTitle={data.nom}
				itemData={data}
				extraData={extra}
			/>
		</>
	) : (
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

	const session = (await getServerSession(context.req, context.res, authOptions)) as MySession | null

	// return empty props if we don't have an auth token
	// because if means we have no way to retrieve the data

	if (session == null) return { props: { data: null, extra: null } }

	// make the API request

	let is404 = false
	let is401 = false
	let isError = false

	const data = await SSRmakeAPIRequest<Element, Element>({
		session: session,
		verb: "get",
		itemType: itemType,
		additionalPath: `id/${elementId}`,
		onSuccess: (res) => res.data,
		onFailure: (error) => {
			if (isAuthError(error)) is401 = true
			else if (axios.isAxiosError(error) && error.response?.status == 404) {
				is404 = true
			} else {
				isError = true
			}
		}
	})

	if (is401 || isError) return { props: { data: null, extra: null } }
	// in case the provided exposition_id doesn't exist in the database
	else if (is404) return { notFound: true } // show the 404 page

	// retrieving the extra data we need to display

	const exposition = await getExtraSSRData(session, "expositions", (data as Element).exposition_id)

	const etat = await getExtraSSRData(session, "etats_elements", (data as Element).etat_id)

	const exploitation = await getExtraSSRData(session, "exploitations_elements", (data as Element).exploitation_id)

	const localisation = await getExtraSSRData(session, "localisations_elements", (data as Element).localisation_id)

	// if everything went well
	// return the data as Props

	return {
		props: {
			data: data ? data : null,
			extra: {
				exposition: exposition ? exposition : "Erreur",
				etat: etat ? etat : "Erreur",
				exploitation: exploitation ? exploitation : "Erreur",
				localisation: localisation ? localisation : "Erreur"
			}
		}
	}
}

export default ViewElements
