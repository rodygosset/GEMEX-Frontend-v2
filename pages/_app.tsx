import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {


	return (
		<>
			<Head>
				{/* set up favicon */}
				<link rel="shortcut icon" href="favicon/favicon.svg" type="img/svg" />
				<link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
          		<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png"/>
          		<link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png"/>
			</Head>
			<Component {...pageProps} />
		</>
	)
}

export default MyApp
