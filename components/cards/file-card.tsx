import styles from "@styles/components/cards/file-card.module.scss"
import { Fichier } from "@conf/api/data-types/fichier"
import { getUserFullName, User } from "@conf/api/data-types/user"
import { useEffect, useState } from "react"
import useAPIRequest from "@hook/useAPIRequest"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { destructFileName, FileInfo } from "@utils/fichiers"
import FilePreviewer from "@components/modals/file-previewer"
import Button from "@components/button"
import { faFolderOpen, faXmark } from "@fortawesome/free-solid-svg-icons"
import { useSession } from "next-auth/react"
import { MySession } from "@conf/utility-types"
import { cn } from "@utils/tailwind"

interface Props {
	file: Fichier
	multiSelectionMode?: boolean
	isSelected?: boolean
	isSearchResult?: boolean
	isListItem?: boolean
	onDeSelect?: () => void
	onClick?: () => void
}

const FileCard = ({ file, multiSelectionMode, isSelected, isSearchResult, isListItem, onDeSelect, onClick }: Props) => {
	// retrieve info about the user who owns the file from our API

	const [fileOwner, setFileOwner] = useState<User>()

	const [fileInfo, setFileInfo] = useState<FileInfo>()

	// get session data

	const { data } = useSession()

	const session = data as MySession | null

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

	// render

	// only render the card once we've extracted the info we want to display

	return fileOwner && fileInfo ? (
		<FilePreviewer
			fileName={file.nom}
			fileInfo={fileInfo}
			ownerFullName={getUserFullName(fileOwner)}>
			<li
				className={cn(
					"flex items-center gap-4 p-4",
					"border border-blue-600/20 rounded-[8px] cursor-pointer",
					"hover:bg-blue-600/10 duration-200 transition-all",
					"min-w-[320px] max-[918px]:flex-1"
				)}>
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
				<div className="flex flex-col">
					<span className="text-base font-medium text-blue-600">
						{fileInfo.fileName}
						{
							// don't display the count if it ain't at least one
							fileInfo.count > 0 ? ` (${fileInfo.count})` : ""
						}
					</span>
					<span className="text-sm font-normal text-blue-600/60">{fileInfo.author}</span>
				</div>
				{isSearchResult ? (
					<div className={styles.viewButtonContainer}>
						<Button
							className={styles.viewButton}
							icon={faFolderOpen}
							role="tertiary"
							onClick={(e) => {
								e.stopPropagation()
							}}>
							{""}
						</Button>
					</div>
				) : (
					<></>
				)}
			</li>
		</FilePreviewer>
	) : (
		<></>
	)
}

export default FileCard
