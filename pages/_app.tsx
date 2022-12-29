import '../styles/globals.scss'
import '@fortawesome/fontawesome-svg-core/styles.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { SessionProvider } from 'next-auth/react'
import RouteGard from '@components/utils/route-gard'
import Nav from '@components/layout/nav'

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {


	return (
		<SessionProvider session={session}>
			<Head>
				{/* set up favicon */}
				<link rel="shortcut icon" href="favicon/favicon.svg" type="img/svg" />
				<link rel="apple-touch-icon" sizes="180x180" href="/favicon/favicon-180x180.png" />
          		<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png"/>
          		<link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png"/>
			</Head>
			<RouteGard>
				<Nav/>
				<Component {...pageProps} />
			</RouteGard>
		</SessionProvider>
	)
}

export default MyApp
