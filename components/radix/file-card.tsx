import { Fichier } from "@conf/api/data-types/fichier"
import { User, getUserFullName } from "@conf/api/data-types/user"
import { MySession } from "@conf/utility-types"
import useAPIRequest from "@hook/useAPIRequest"
import { FileInfo, destructFileName } from "@utils/fichiers"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import FileCardSkeleton from "./file-card-skeleton"
import FilePreviewer from "@components/modals/file-previewer"
import { cn } from "@utils/tailwind"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFolderOpen, faXmark } from "@fortawesome/free-solid-svg-icons"

interface Props {
	className?: string
	file: Fichier
	selected?: boolean
	multiSelectionMode?: boolean
	isSearchResult?: boolean
	onClick?: () => void
	onDeSelect?: () => void
}

const FileCard = ({ className, file, selected, multiSelectionMode, isSearchResult, onClick, onDeSelect }: Props) => {
	// data logic

	// retrieve info about the user who owns the file from our API

	const [fileOwner, setFileOwner] = useState<User>()

	const [fileInfo, setFileInfo] = useState<FileInfo>()

	// get session data

	const session = useSession().data as MySession | null

	const makeAPIRequest = useAPIRequest()

	const getOwner = () => {
		if (!session) return
		makeAPIRequest<User, void>(session, "get", "users", `id/${file.user_id}`, undefined, (res) => setFileOwner(res.data))
	}

	useEffect(() => getOwner(), [file, session])

	// once we've got the data we need
	// extract useful info from the file name

	useEffect(() => {
		if (!fileOwner) return
		setFileInfo(destructFileName(file.nom, fileOwner))
	}, [fileOwner])

	// file previewer control logic

	const [open, setOpen] = useState(false)

	// render

	return fileOwner && fileInfo ? (
		<FilePreviewer
			fileName={file.nom}
			fileInfo={fileInfo}
			ownerFullName={getUserFullName(fileOwner)}
			open={open}
			// if the card is in multi selection mode or a search result, don't open the previewer on click
			onOpenChange={isSearchResult && !open ? undefined : setOpen}>
			<li
				onClick={(e) => {
					e.stopPropagation()
					if (onClick) onClick()
				}}
				className={cn(
					"w-full flex items-center gap-4 p-4 cursor-pointer ",
					isSearchResult ? "" : "border border-blue-600/20 rounded-[8px]",
					"hover:bg-blue-600/10 duration-200 transition-all",
					"min-w-[320px] flex-1",
					className,
					selected ? "border-[2px] border-blue-600 bg-blue-600/5 rounded-[8px]" : ""
				)}>
				<article className="w-full flex items-center gap-4">
					{multiSelectionMode && onDeSelect ? (
						<button
							className={cn(
								"text-blue-600/60 hover:text-red-600/80 transition-all p-[8px] hover:bg-red-600/10",
								"rounded-[8px] w-[32px] h-[32px] flex items-center justify-center cursor-pointer"
							)}
							onClick={onDeSelect}>
							<FontAwesomeIcon icon={faXmark} />
						</button>
					) : (
						<></>
					)}
					<FontAwesomeIcon
						icon={fileInfo.icon}
						className="text-blue-600 text-2xl"
					/>
					<div className="flex flex-col flex-1">
						<span className="w-full max-w-[200px] text-base font-medium text-blue-600 whitespace-nowrap overflow-hidden text-ellipsis">
							{fileInfo.fileName}
							{
								// don't display the count if it ain't at least one
								fileInfo.count > 0 ? ` (${fileInfo.count})` : ""
							}
						</span>
						<span className="text-sm font-normal text-blue-600/60">{fileInfo.author}</span>
					</div>
					{isSearchResult ? (
						<button
							onClick={(e) => {
								e.stopPropagation()
								setOpen(true)
							}}
							className={cn(
								"h-[48px] w-[48px] flex items-center justify-center rounded-[8px] border border-blue-600/20",
								"text-blue-600 text-xl hover:bg-blue-600/10 transition-all cursor-pointer"
							)}>
							<FontAwesomeIcon icon={faFolderOpen} />
						</button>
					) : (
						<></>
					)}
				</article>
			</li>
		</FilePreviewer>
	) : (
		<FileCardSkeleton />
	)
}

export default FileCard
