import { APPROVED_STATUS_ID, DONE_STATUS_ID, Fiche, INIT_STATUS_ID, REQUEST_STATUS_ID } from "@conf/api/data-types/fiche"
import { User } from "@conf/api/data-types/user"
import { MySession } from "@conf/utility-types"
import { isAuthError } from "@utils/req-utils"
import SSRmakeAPIRequest from "@utils/ssr-make-api-request"
import axios from "axios"
import { GetServerSideProps, NextPage } from "next"
import { getServerSession } from "next-auth"
import { useSession } from "next-auth/react"
import Head from "next/head"
import { authOptions } from "pages/api/auth/[...nextauth]"
import My401Template from "pages/page-templates/401-template"
import EditTemplate from "pages/page-templates/edit-template"
import { useEffect } from "react"

// this page displays information about a given Fiche object
// the data is retrieved in getServerSideProps

const itemType = "fiches"

interface Props {
	data: Fiche | null
	usersInGroups: string[] | null
}

const EditFiche: NextPage<Props> = ({ data, usersInGroups }) => {
	const session = useSession()

	const user = (session.data as MySession | null)?.user
	const userRole = (session.data as MySession | null)?.userRole

	// utils

	// determine whether the user is authorized to edit the current item

	const userHasRequiredPermissions = () => (userRole && userRole.permissions.includes(itemType) ? true : false)

	const userIsOwner = () => (data && user && data.auteur_id == user.id ? true : false)
	const userIsManager = () => (userRole && userRole.permissions.includes("manage") ? true : false)
	const userWasAssignedTask = () => (data && user && data.user_en_charge_id == user.id ? true : false)
	const userIsInGroup = () => usersInGroups && usersInGroups.some((u) => user?.username === u)

	const userCanEditFiche = () => userHasRequiredPermissions() && (userIsOwner() || userIsManager() || userWasAssignedTask() || userIsInGroup())

	const allowEdit = () =>
		// don't allow approved task reports (Fiches) to be edited
		data?.status_id != APPROVED_STATUS_ID &&
		// otherwise make sure the user has something to do with the task report
		userCanEditFiche() &&
		// only allow the owner or a manager to edit a fiche that's still
		// in request status
		(data?.status_id == REQUEST_STATUS_ID ? userIsManager() || userIsOwner() : true)

	// determine which fields to disable
	// depending on the Fiche status, the user's role
	// & the user's relation to the Fiche (author, assignee)

	const getExcludedFields = () => {
		if (!user || !userRole || !data) return []
		// editable fields are limited only for specific fiche status'
		const limitedEditStatus = [INIT_STATUS_ID, DONE_STATUS_ID]
		// if the user didn't create the Fiche & isn't a manager
		if (limitedEditStatus.includes(data.status_id) && !userIsOwner() && !userIsManager()) {
			// then the user was assigned the task
			// so only allow them to edit the "remarque" & "date_fin" fields
			const allowedFields = ["remarque", "date_fin"]
			// to do that, exclude all the other fields
			return Object.keys(data).filter((field) => !allowedFields.includes(field))
		}
		return []
	}

	const getErrorMessage = () => `Vous n'avez pas les droits pour modifier la fiche "${data?.nom}"`

	// render

	return user && userRole && data && allowEdit() ? (
		<>
			<Head>
				<title>Modifier {data.nom} (Fiche)</title>
				<meta
					name="description"
					content={`Modifier la fiche ${data.nom}`}
				/>
			</Head>
			<EditTemplate
				itemType={itemType}
				defaultValues={data}
				excluded={getExcludedFields()}
			/>
		</>
	) : // in case the user isn't allowed to edit the task report
	user && userRole && data && !allowEdit() ? (
		<My401Template errorMessage={getErrorMessage()} />
	) : (
		// if we couldn't retrive the data
		// let the user know there was a problem
		<>Error</>
	)
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
	// retrive the data about the expo by making a request to our backend API

	// start with getting the item's DB id

	const ficheId = context.query.id

	// retrieve the session, containing the user's auth token

	const session = (await getServerSession(context.req, context.res, authOptions)) as MySession | null

	// return empty props if we don't have an auth token
	// because if means we have no way to retrieve the data

	if (session == null) return { props: { data: null, usersInGroups: null } }

	// make the API request

	let is404 = false
	let is401 = false
	let isError = false

	const data = await SSRmakeAPIRequest<Fiche, Fiche>({
		session: session,
		verb: "get",
		itemType: itemType,
		additionalPath: `id/${ficheId}`,
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

	const author = data
		? await SSRmakeAPIRequest<User, User>({
				session: session,
				verb: "get",
				itemType: "users",
				additionalPath: `id/${data.auteur_id}`,
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
		: null

	const userEnCharge = data
		? await SSRmakeAPIRequest<User, User>({
				session: session,
				verb: "get",
				itemType: "users",
				additionalPath: `id/${data.user_en_charge_id}`,
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
		: null

	interface Group {
		id: number
		nom: string
		users: string[]
	}

	const getGroupUsernames = async (groupName: string) =>
		await SSRmakeAPIRequest<Group, string[]>({
			session: session,
			verb: "get",
			itemType: "groups",
			additionalPath: `${groupName}/`,
			onSuccess: (res) => res.data.users,
			onFailure: (error) => {}
		})

	const usersInGroupsSettledPromises =
		author && userEnCharge ? await Promise.allSettled([...author.groups.map(getGroupUsernames), ...userEnCharge.groups.map(getGroupUsernames)]) : null

	// resolve settled promises
	const usersInGroups = usersInGroupsSettledPromises
		? Array.from(
				new Set(
					usersInGroupsSettledPromises
						.filter((p): p is PromiseFulfilledResult<string[]> => p.status == "fulfilled")
						.map((p) => p.value)
						.filter((v): v is string[] => !!v)
						.flat()
				)
			)
		: null

	if (is401 || isError) return { props: { data: null, usersInGroups: null } }
	// in case the provided fiche_id doesn't exist in the database
	else if (is404) return { notFound: true } // show the 404 page

	// if everything went well
	// return the data as Props

	return {
		props: {
			data: data ? data : null,
			usersInGroups: usersInGroups ? usersInGroups : null
		}
	}
}

export default EditFiche
