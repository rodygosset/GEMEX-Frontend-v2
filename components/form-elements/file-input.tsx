import { Fichier } from "@conf/api/data-types/fichier"
import useAPIRequest from "@hook/useAPIRequest"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { faCloud, faLaptop } from "@fortawesome/free-solid-svg-icons"
import Image from "next/image"
import GenericModalDialog from "@components/modals/generic-modal-dialog"
import FilePicker from "@components/radix/file-picker"
import { useSession } from "next-auth/react"
import { MySession } from "@conf/utility-types"
import FileCard from "@components/radix/file-card"
import { Button } from "@components/radix/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

interface Props {
	value: string[]
	onChange: (newValue: string[]) => void
}

const FileInput = ({ value, onChange }: Props) => {
	// state

	const [fichiers, setFichiers] = useState<Fichier[]>([])

	const isFileLoaded = (fileName: string, fileList: Fichier[]) => fileList.map((f) => f.nom).includes(fileName)

	// value being a list of file names we want to render in cards
	// we need to get info on each file from the API
	// by making an API request

	const makeAPIRequest = useAPIRequest()

	const { data, status } = useSession()

	const session = data as MySession | null

	const getFiles = () => {
		if (!session) return
		setFichiers([])
		for (const fileName of value) {
			makeAPIRequest<Fichier[], void>(
				session,
				"post",
				"fichiers",
				"search/",
				{
					nom: fileName
				},
				(res) => {
					// make sure we don't load the same file twice
					setFichiers((currentList) => {
						if (isFileLoaded(res.data[0].nom, currentList)) return currentList
						return [...currentList, ...res.data]
					})
				}
			)
		}
	}

	// keep fichiers up to date with value

	useEffect(() => getFiles(), [value, session])

	// manage local file upload

	const [localFile, setLocalFile] = useState<File | undefined>()

	// open the dialog when the user clicks on the upload button

	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleUploadClick = () => {
		if (!fileInputRef.current) return
		fileInputRef.current.click()
	}

	// the native HTML file input handles letting the user choose a file
	// so we only have to get back the chosen file's info

	const handleLocalFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return
		setLocalFile(e.target.files[0])
	}

	// upload confirmation dialog

	const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)

	// if the file isn't empty,
	// show the confirmation dialog

	useEffect(() => {
		setShowConfirmationDialog(localFile ? true : false)
	}, [localFile])

	// upload the file selected by the user

	const uploadLocalFile = () => {
		if (!localFile || !session) return
		// we need to create a form data object
		// so we can upload the file over HTTP to our API
		const formData = new FormData()
		formData.append("new_fichier", localFile)

		// upload

		makeAPIRequest<Fichier, void>(
			session,
			"post",
			"fichiers",
			undefined,
			formData,
			// when the file is done uploading,
			// add it to the list of selected files
			(res) => {
				onChange([...value, res.data.nom])
				setLocalFile(undefined)
			}
		)
	}

	// manage GEMEX file picker modal

	const [showFilePicker, setShowFilePicker] = useState(false)

	const handleFileSelect = (fileName: string) => {
		// don't include the same file more than once in the list
		if (value.includes(fileName)) return
		onChange([...value, fileName])
	}

	// make sure there are files that have been selected
	// & that we have gotten the info we need
	// before rendering the list of files in to cards

	const fileListIsEmpty = () => !value || fichiers.length == 0 || fichiers.length != value.length

	// allow the user to de-select files

	const handleDeSelect = (fileName: string) => onChange(value.filter((f) => f != fileName))

	// render

	return (
		<>
			<div className="flex flex-col gap-[32px] w-full">
				<span className="text-sm text-blue-600 font-medium">Fichiers</span>
				<div className="flex flex-wrap gap-[16px]">
					{!fileListIsEmpty() ? (
						// if files have been selected
						<ul className="flex flex-wrap items-center gap-[16px]">
							{fichiers.map((file) => {
								return (
									<FileCard
										key={file.nom + "_file_input"}
										file={file}
										multiSelectionMode
										onDeSelect={() => handleDeSelect(file.nom)}
									/>
								)
							})}
						</ul>
					) : (
						<></>
					)}
					<div className="flex flex-wrap items-center gap-[32px] w-full">
						{
							// in case there's no files yet
							fileListIsEmpty() ? (
								<div className="relative w-[128px] aspect-square">
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
							) : (
								<></>
							)
						}
						<div className="flex flex-col justify-center gap-[16px] max-sm:w-full">
							{
								// in case there's no files yet
								fileListIsEmpty() ? <span className="text-sm font-normal text-blue-600/60">Aucun fichier sélectionné</span> : <></>
							}
							<Button
								className="flex sm:justify-start gap-[8px] w-full"
								variant="outline"
								type="button"
								onClick={handleUploadClick}>
								<input
									type="file"
									id="file"
									ref={fileInputRef}
									hidden
									onClick={(e) => e.stopPropagation()}
									onChange={handleLocalFileChange}
								/>
								<FontAwesomeIcon icon={faLaptop} />
								<span>Ajouter un fichier local</span>
							</Button>
							<Button
								className="flex sm:justify-start items-center gap-[8px] min-w-[256px]"
								variant="outline"
								type="button"
								onClick={() => setShowFilePicker(true)}>
								<FontAwesomeIcon icon={faCloud} />
								Choisir un fichier dans GEMEX
							</Button>
						</div>
					</div>
				</div>
			</div>
			<GenericModalDialog
				isVisible={showConfirmationDialog}
				title="Ajouter un fichier local"
				question="Sauvegarder ce fichier dans GEMEX ?"
				yesOption="Sauvegarder"
				noOption="Annuler"
				onYesClick={uploadLocalFile}
				onNoClick={() => setLocalFile(undefined)}
				closeModal={() => setShowConfirmationDialog(false)}
			/>
			<FilePicker
				open={showFilePicker}
				onOpenChange={setShowFilePicker}
				onSelect={handleFileSelect}
			/>
		</>
	)
}

export default FileInput
