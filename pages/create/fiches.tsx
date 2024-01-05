import { MySession } from "@conf/utility-types"
import { NextPage } from "next"
import { useSession } from "next-auth/react"
import Head from "next/head"
import CreateTemplate from "pages/page-templates/create-template"

const itemType = "fiches"

const CreateFiche: NextPage = () => {
	const session = useSession().data as MySession | null

	const userRole = session?.userRole

	// by default
	// assign the task to the current user

	const getDefaultValues = () => {
		if (!session?.user) return {}
		return {
			user_en_charge_id: session.user.id
		}
	}

	// if the current user isn't a manager
	// don't allow them to assign a task to someone other than themselves
	// by hiding the field

	const getHiddenFields = () => {
		if (!userRole || !userRole.permissions.includes("manage")) {
			return ["user_en_charge_id"]
		}
		return []
	}

	// render

	return (
		<>
			<Head>
				<title>Créer une fiche</title>
				<meta
					name="description"
					content={`Création d'une fiche - GEMEX`}
				/>
			</Head>
			<CreateTemplate
				itemType={itemType}
				defaultValues={getDefaultValues()}
				hidden={getHiddenFields()}
			/>
		</>
	)
}

export default CreateFiche
