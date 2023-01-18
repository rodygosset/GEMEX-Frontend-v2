import SearchBar from "@components/form-elements/search-bar"
import styles from "@styles/pages/search.module.scss"
import { NextPage } from "next"
import { useSession } from "next-auth/react"
import Head from "next/head"

const Search: NextPage = () => {

    const { data: session, status } = useSession()

    // todo => parse the url into a SearchParams objects

    return (
        <main id={styles.container}>
            <Head>
				<title>Recherche</title>
				<meta name="description" content="Page de recherche de GEMEX" />
			</Head>
            <form onSubmit={e => e.preventDefault()}>
				<SearchBar
                    fullWidth
                />
			</form>
        </main>
    )
}

export default Search