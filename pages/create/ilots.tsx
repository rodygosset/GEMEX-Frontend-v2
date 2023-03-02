import { NextPage } from "next"
import Head from "next/head"
import CreateTemplate from "pages/page-templates/create-template"

const itemType = "ilots"

const CreateIlot: NextPage = () => {

    // render

    return (
        <>
            <Head>
                <title>Créer un ilôt</title>
                <meta name="description" content={`Création d'un ilôt - GEMEX`} />
            </Head>
            <CreateTemplate 
                itemType={itemType} 
            />
        </>
    )

}

export default CreateIlot