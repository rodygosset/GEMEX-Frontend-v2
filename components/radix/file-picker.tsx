import { cn } from "@utils/tailwind"
import { Dialog, DialogContent } from "./dialog"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { Fichier } from "@conf/api/data-types/fichier"
import { useSession } from "next-auth/react"
import { MySession } from "@conf/utility-types"
import useAPIRequest from "@hook/useAPIRequest"
import { ScrollArea } from "./scroll-area"
import FileCard from "./file-card"
import FileCardSkeleton from "./file-card-skeleton"
import { Button } from "./button"

interface FileCategory {
	id: number
	name: string
	description: string
}

const fileCategories: FileCategory[] = [
	{
		id: 1,
		name: "Mes fichiers",
		description: "Fichiers que vous avez ajoutés à GEMEX"
	},
	{
		id: 2,
		name: "Tous les fichiers",
		description: "Tous les fichiers ajoutés à GEMEX"
	}
]

const LoadingState = () => (
	<ScrollArea className="w-full h-full max-h-[430px] min-h-0 flex flex-col">
		<ul className="w-full flex-1 flex flex-col min-h-0">
			<FileCardSkeleton />
			<FileCardSkeleton />
			<FileCardSkeleton />
			<FileCardSkeleton />
			<FileCardSkeleton />
			<FileCardSkeleton />
		</ul>
	</ScrollArea>
)

interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSelect?: (fileName: string) => void
	isExplorer?: boolean
}

const FilePicker = ({ open, onOpenChange, onSelect, isExplorer }: Props) => {
	// get the session to make API calls & the current user

	const session = useSession().data as MySession | null

	// state

	const [q, setQ] = useState("")

	const [currentCategory, setCurrentCategory] = useState<FileCategory>(fileCategories[0])

	const [files, setFiles] = useState<Fichier[]>([])

	const [loading, setLoading] = useState(false)

	// file picking state

	const [selectedFileName, setSelectedFileName] = useState("")

	// get the files from the API

	const makeAPIRequest = useAPIRequest()

	const getSearchParams = () => {
		if (!session) return {}
		let searchParams: { [key: string]: any } = {}
		if (q) searchParams["nom"] = q
		if (currentCategory.id === 1) searchParams["user_id"] = session.user.id
		return searchParams
	}

	useEffect(() => {
		if (!session) return

		setLoading(true)

		// clear the selected file

		setSelectedFileName("")

		// make the API call

		makeAPIRequest<Fichier[], void>(session, "post", "fichiers", "search/", getSearchParams(), (res) => {
			setFiles(res.data)
			setLoading(false)
		})
	}, [q, currentCategory, session])

	// reset the state when the dialog closes

	const handleOpenChange = (open: boolean) => {
		setQ("")
		setCurrentCategory(fileCategories[0])
		setSelectedFileName("")
		onOpenChange(open)
	}

	// file selection logic

	const toggleSelection = (fileName: string) => {
		if (isExplorer) return

		if (selectedFileName === fileName) {
			setSelectedFileName("")
		} else {
			setSelectedFileName(fileName)
		}
	}

	// render

	return (
		<Dialog
			open={open}
			onOpenChange={handleOpenChange}>
			<DialogContent
				className={cn(
					"max-w-screen-sm max-sm:bottom-0 bg-neutral-50/40 backdrop-blur-3xl",
					"ring-4 ring-blue-600/30 flex flex-col",
					"sm:max-h-[600px] flex flex-col h-full max-h-[80vh]",
					"max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0"
				)}>
				<div className={cn("w-full flex items-center gap-[8px] p-[16px] h-[64px] rounded-t-[8px]", "border-b border-blue-600/10")}>
					<FontAwesomeIcon
						icon={faSearch}
						className="text-sm text-blue-600"
					/>
					<input
						className={cn("w-full bg-transparent focus:outline-none", "text-sm font-normal text-blue-600", "placeholder:text-blue-600/60")}
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Rechercher par nom de fichier..."
					/>
				</div>
				<Tabs
					className="h-full flex flex-col gap-[16px] items-start p-[16px] flex-1"
					value={currentCategory.name}
					onValueChange={(v) => setCurrentCategory(fileCategories.find((category) => category.name === v) as FileCategory)}>
					<div className="w-full flex gap-[16px] items-center justify-between">
						<TabsList>
							{fileCategories.map((category) => (
								<TabsTrigger
									key={category.id}
									value={category.name}>
									{category.name}
								</TabsTrigger>
							))}
						</TabsList>
						{!isExplorer ? (
							<Button
								onClick={() => {
									if (onSelect) onSelect(selectedFileName)
									handleOpenChange(false)
								}}
								disabled={!selectedFileName}>
								Sélectionner
							</Button>
						) : (
							<></>
						)}
					</div>
					<TabsContent
						className="w-full h-full flex-1 min-h-0 m-0"
						value={currentCategory.name}>
						{loading ? (
							<LoadingState />
						) : files.length > 0 ? (
							<ScrollArea
								className="w-full h-full max-h-[60vh] sm:max-h-[430px] min-h-0 flex flex-col border border-blue-600/20 rounded-[8px]"
								onClick={() => !isExplorer && setSelectedFileName("")}>
								<ul className="w-full h-full flex-1 flex flex-col min-h-0">
									{files.map((file) => (
										<FileCard
											className="border-b border-blue-600/20"
											key={file.id}
											file={file}
											selected={file.nom === selectedFileName}
											isSearchResult
											onClick={() => toggleSelection(file.nom)}
										/>
									))}
								</ul>
							</ScrollArea>
						) : (
							<div className="flex-1 h-full flex items-center justify-center">
								<p className="text-blue-600/60 text-sm">Aucun fichier trouvé</p>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	)
}

export default FilePicker
