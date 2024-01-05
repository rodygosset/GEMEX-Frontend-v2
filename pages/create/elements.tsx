import { NextPage } from "next"
import Head from "next/head"
import CreateTemplate from "pages/page-templates/create-template"

const itemType = "elements"

const CreateElement: NextPage = () => {
	// render

	return (
		<>
			<Head>
				<title>Créer un element</title>
				<meta
					name="description"
					content={`Création d'un element - GEMEX`}
				/>
			</Head>
			<CreateTemplate itemType={itemType} />
		</>
	)
}

export default CreateElement
