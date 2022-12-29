import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '@styles/pages/home.module.scss'
import { signOut, useSession } from 'next-auth/react'
import { useEffect } from 'react'
import PrimaryCTA from '@components/buttons/primary-cta'
import Nav from '@components/layout/nav'

const Home: NextPage = () => {

	const { data: session, status } = useSession()

	// @ts-ignore
	useEffect(() => console.log(session?.user?.username, status), [session])

	const handleLogOut = () => signOut({ callbackUrl: '/login' })

	return (
		<div className={styles.container}>
			<Head>
				<title>Accueil</title>
				<meta name="description" content="Page d'accueil de l'application GEMEX" />
			</Head>

			<main className={styles.main}>
				<PrimaryCTA onClick={handleLogOut}>Déconnexion</PrimaryCTA>
			</main>
		</div>
	)
}

export default Home
