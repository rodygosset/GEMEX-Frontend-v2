import { apiURLs } from "@conf/api/conf"
import { faDownload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/components/modals/file-previewer.module.scss"
import { FileInfo } from "@utils/fichiers"
import Image from "next/image"
import dynamic from "next/dynamic"
import { Dialog, DialogContent, DialogTrigger } from "@components/radix/dialog"
import { cn } from "@utils/tailwind"
import { buttonVariants } from "@components/radix/button"

const MyPDFViewer = dynamic(() => import("./my-pdf-viewer"), { ssr: false })

interface Props {
	children: React.ReactNode
	fileName: string
	fileInfo: FileInfo
	ownerFullName: string
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

const FilePreviewer = ({ children, fileName, fileInfo, ownerFullName, open, onOpenChange }: Props) => {
	// the following function computes how to render the file's content

	const renderFilePreview = () => {
		const extension = fileInfo.extension
		switch (extension) {
			case "jpg":
			case "jpeg":
			case "png":
			case "gif":
				return (
					<div className="relative w-full h-full max-h-[60vh]">
						{/* <Image
							src={getFileURL()}
							alt={fileInfo.fileName}
							fill
							style={{
								objectFit: "contain"
							}}
							className="w-full h-full"
						/> */}
						<img
							className="w-full h-full object-contain"
							src={getFileURL()}
							alt={`${fileInfo.fileName} (${fileInfo.count}) preview`}
						/>
					</div>
				)
			// case "pdf":
			// 	return <MyPDFViewer URL={getFileURL()} />
			default:
				return (
					<div className="flex-1 w-full h-full flex flex-col gap-[32px] justify-center items-center">
						<div className="relative w-full max-w-[340px] aspect-square">
							<Image
								quality={100}
								src={"/images/void.svg"}
								alt={"Aucun fichier"}
								priority
								fill
								style={{
									objectFit: "contain",
									top: "auto"
								}}
							/>
						</div>
						<span className="text-sm font-normal text-blue-600/60">Pas d&apos;aperçue disponible pour ce type de fichier.</span>
					</div>
				)
		}
	}

	// utils

	const getFileURL = () => `${apiURLs["fichiers"]}${fileName}/`

	// render

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				className={cn(
					"max-h-[90vh]  h-full w-screen sm:w-full sm:max-w-[90vw] max-sm:max-w-full p-[32px] pt-[64px]",
					"flex flex-col gap-4",
					"max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0"
				)}>
				<div className="w-full flex justify-between gap-4">
					<div className="flex flex-col justify-center w-full">
						<div className="flex items-center gap-4 text-xl md:text-2xl text-blue-600">
							<FontAwesomeIcon icon={fileInfo.icon} />
							<span>
								{fileInfo.fileName}
								{
									// don't display the count if it ain't at least one
									fileInfo.count > 0 ? ` (${fileInfo.count})` : ""
								}
							</span>
						</div>
						<span className="text-sm font-normal text-blue-600/60">{ownerFullName}</span>
					</div>
					<a
						className={cn(buttonVariants(), "gap-[8px] items-center")}
						onClick={(e) => e.stopPropagation()}
						href={getFileURL()}
						download={fileName}>
						<FontAwesomeIcon icon={faDownload} />
						Télécharger
					</a>
				</div>
				{renderFilePreview()}
			</DialogContent>
		</Dialog>
	)
}

export default FilePreviewer
