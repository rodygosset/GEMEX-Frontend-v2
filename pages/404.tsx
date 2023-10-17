import { buttonVariants } from "@components/radix/button"
import { faHome } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { cn } from "@utils/tailwind"

import Image from "next/image"
import Link from "next/link"

const My404 = () => {
	return (
		<main className="w-full h-full flex-1 flex flex-col items-center justify-center gap-[32px] px-[7%] pt-[24px]">
			<div className="w-full max-w-[600px] max-h-[60vh] relative aspect-[1.226]">
				<Image
					quality={100}
					src={"/images/404-illustration.svg"}
					alt={"Erreur 404."}
					priority
					fill
					style={{
						objectFit: "contain",
						top: "auto"
					}}
				/>
			</div>
			<div className="w-full flex flex-col items-center">
				<h1 className="text-3xl text-purple-600">Oups !</h1>
				<span className="text-base text-blue-600/60">Cette page n’existe pas... :-(</span>
			</div>
			<Link
				className={cn(buttonVariants({ variant: "outline" }), "flex items-center gap-[8px]")}
				href="/">
				<FontAwesomeIcon icon={faHome} />
				Retour à l'accueil
			</Link>
		</main>
	)
}

export default My404
