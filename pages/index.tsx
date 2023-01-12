import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '@styles/pages/home.module.scss'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import Button from '@components/button'

interface Props {
	expo: unknown;
}

const Home: NextPage<Props> = () => {

	const { data: session, status } = useSession()

	// @ts-ignore
	useEffect(() => console.log(session?.user?.username, status), [session])



	return (
		<div className={styles.container}>
			<Head>
				<title>Accueil</title>
				<meta name="description" content="Page d'accueil de l'application GEMEX" />
			</Head>

			<main className={styles.main}>
				<Button
					role="primary"
					active={true}
					onClick={() => alert('hello')}>
					Click Me!
				</Button>
			</main>
		</div>
	)
}

export default Home
