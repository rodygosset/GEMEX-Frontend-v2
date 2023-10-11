import { apiURLs, dockerAPIURL } from "@conf/api/conf"
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
}

const FilePreviewer = ({ children, fileName, fileInfo, ownerFullName }: Props) => {
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
						<Image
							src={getFileURL()}
							alt={fileInfo.fileName}
							fill
							style={{
								objectFit: "contain"
							}}
							className={styles.image}
						/>
					</div>
				)
			case "pdf":
				return <MyPDFViewer URL={getFileURL()} />
			default:
				return <span className="text-sm font-normal text-blue-600/60">Pas d&apos;aperçue disponible pour ce type de fichier.</span>
		}
	}

	// utils

	const getFileURL = () => `${dockerAPIURL}${apiURLs["fichiers"]}${fileName}`

	// render

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				className={cn(
					"max-h-[90vh]  h-full w-screen sm:w-full sm:max-w-[90vw] max-sm:max-w-full p-[32px] pt-[64px]",
					"flex flex-col gap-[16px]",
					"max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0"
				)}>
				<div className="w-full flex justify-between gap-[16px]">
					<div className="flex flex-col justify-center w-full">
						<div className="flex items-center gap-[16px] text-xl md:text-2xl text-blue-600">
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
