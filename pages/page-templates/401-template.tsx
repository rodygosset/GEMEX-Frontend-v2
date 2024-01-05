import Button from "@components/button"
import { Context } from "@utils/context"
import { useRouter } from "next/router"
import { useContext, useEffect } from "react"
import styles from "@styles/page-templates/error-page-template.module.scss"
import Image from "next/image"
import Link from "next/link"
import { faHome } from "@fortawesome/free-solid-svg-icons"

interface Props {
	errorMessage: string
}

const My401Template = ({ errorMessage }: Props) => {
	const router = useRouter()

	const handleClick = () => {
		setNavHistory(navHistory.filter((route) => route != "/401"))
		router.push("/")
	}

	// hide the header by indicating we're currently on an error page

	const { navHistory, setNavHistory } = useContext(Context)

	useEffect(() => {
		if (navHistory[navHistory.length - 1] != "/401") {
			// @ts-ignore
			setNavHistory((current) => [...current, "/401"])
		}
	}, [])

	// render

	return (
		<main className={styles.container}>
			<div className={styles.illustrationContainer}>
				<Image
					quality={100}
					src={"/images/401-illustration.svg"}
					alt={"Non autorié"}
					priority
					fill
					style={{
						objectFit: "contain",
						top: "auto"
					}}
				/>
			</div>
			<h1>Oups !</h1>
			<p>{errorMessage}</p>
			<Button
				icon={faHome}
				role="secondary"
				bigPadding
				onClick={handleClick}>
				<Link
					href="/"
					onClick={handleClick}>
					Retourner à l&apos;accueil
				</Link>
			</Button>
		</main>
	)
}

export default My401Template
