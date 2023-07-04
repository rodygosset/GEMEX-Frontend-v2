import '../styles/globals.scss'
// for date inputs
import "@styles/components/form-elements/react-datepicker.scss"
import '@fortawesome/fontawesome-svg-core/styles.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { SessionProvider } from 'next-auth/react'
import Header from '@components/layout/header'
import { useEffect, useMemo, useState } from 'react'
import { Context, SearchParamsType } from '@utils/context'
import { useRouter } from 'next/router'
import { AnimatePresence } from 'framer-motion'
import PageTransition from '@components/utils/page-transition'
import nProgress from 'nprogress'

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {

	// set up the search context

	const [searchParams, setSearchParams] = useState<SearchParamsType>({})

	// set up app navigation history

	const [navHistory, setNavHistory] = useState<string[]>([])
	
	// memoize the context
	
	const contextValue = useMemo(() => ({ 
		searchParams, 
		setSearchParams,
		navHistory,
		setNavHistory 
	}), [searchParams, navHistory])


	const router = useRouter()

	useEffect(() => {
		// set up nprogress

		const progressStart = () => nProgress.start()
		const progressDone = () => nProgress.done()
		
		router.events.on('routeChangeStart', progressStart)
		router.events.on('routeChangeComplete', progressDone)
		router.events.on('routeChangeError', progressDone)

		return () => {
			router.events.off('routeChangeStart', progressStart)
			router.events.off('routeChangeComplete', progressDone)
			router.events.off('routeChangeError', progressDone)
		}
	}, [router])

	// keep nav history updated

	useEffect(() => setNavHistory([...navHistory, router.asPath]), [router.asPath])

	return (
		<SessionProvider session={session}>
			<Context.Provider value={contextValue}>
				<Head>
					{/* set up favicon */}
					<link rel="shortcut icon" href="favicon/favicon.svg" type="img/svg" />
					<link rel="apple-touch-icon" sizes="180x180" href="/favicon/favicon-180x180.png" />
					<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png"/>
					<link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png"/>
				</Head>
				<PageTransition>
					<Header/>
					<Component {...pageProps} />
				</PageTransition>
			</Context.Provider>
		</SessionProvider>
	)
}

export default MyApp
