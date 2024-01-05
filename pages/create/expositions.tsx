import { NextPage } from "next"
import Head from "next/head"
import CreateTemplate from "pages/page-templates/create-template"

const itemType = "expositions"

const CreateExposition: NextPage = () => {
	// render

	return (
		<>
			<Head>
				<title>Créer une exposition</title>
				<meta
					name="description"
					content={`Création d&apos;une exposition - GEMEX`}
				/>
			</Head>
			<CreateTemplate itemType={itemType} />
		</>
	)
}

export default CreateExposition
