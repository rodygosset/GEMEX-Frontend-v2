import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '@styles/pages/home.module.scss'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import SearchBar from '@components/form-elements/search-bar'
import { MySession } from '@conf/utility-types'

const Home: NextPage = () => {

	const { data, status } = useSession()

	const session = data as MySession | null

	// @ts-ignore
	useEffect(() => console.log(session?.user?.username, status), [session])

	return (
		<main id={styles.container}>	
			<Head>
				<title>Accueil</title>
				<meta name="description" content="Page d'accueil de l'application GEMEX" />
			</Head>
			<section id={styles.searchSection}>
				<section id={styles.greeting}>
					<h1>Bienvenu { session?.user ? session.user.prenom : '' }</h1>
					<p>La base de données et les fiches sont à portée de main sur GEMEX</p>
				</section>
				<SearchBar/>
			</section>
			<section id={styles.infoContainer}>
				{/* TODO */}
			</section>
		</main>
	)
}

export default Home
