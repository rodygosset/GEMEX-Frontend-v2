import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '@styles/pages/Home.module.scss'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Accueil</title>
        <meta name="description" content="Page d'accueil de l'application GEMEX" />
      </Head>

      <main className={styles.main}>
        
      </main>
    </div>
  )
}

export default Home
