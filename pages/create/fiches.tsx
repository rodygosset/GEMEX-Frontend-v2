import { NextPage } from "next"
import Head from "next/head"
import CreateTemplate from "pages/page-templates/create-template"

const itemType = "fiches"

const CreateFiche: NextPage = () => {

    return (
        <>
            <Head>
                <title>Créer une fiche</title>
                <meta name="description" content={`Création d'une fiche - GEMEX`} />
            </Head>
            <CreateTemplate itemType={itemType} />
        </>
    )

}

export default CreateFiche