import useAPIRequest from "@hook/useAPIRequest"
import { Context } from "@utils/context"
import { useRouter } from "next/router"
import { useContext, useState } from "react"
import { MySession } from "@conf/utility-types"
import { useSession } from "next-auth/react"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from "@components/radix/alert-dialog"

interface Props {
	open: boolean
	isMulti?: boolean
	onOpenChange: (open: boolean) => void
	itemType: string
	customItemID?: string
	itemTitle: string
	itemIDList?: string[]
	onSuccess?: () => void
	goBackOnSuccess?: boolean
}

const DeleteDialog = ({ open, isMulti, onOpenChange, itemType, customItemID, itemTitle, itemIDList, onSuccess, goBackOnSuccess = true }: Props) => {
	// state

	const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)

	// when the user clicks on yes
	// open the confirmation dialog

	const handleYesClick = () => setShowConfirmationDialog(true)

	// if the user cancels when asked to confirm

	const handleCancellation = () => {
		setShowConfirmationDialog(false)
		onOpenChange(false)
	}

	// if the user confirms they intend to delete the item

	const makeAPIRequest = useAPIRequest()

	const session = useSession().data as MySession | null

	const makeDeleteRequest = (itemID: string) => {
		if (!session) return
		return makeAPIRequest(session, "delete", itemType, `${itemID}/`, undefined)
	}

	const handleDeleteSuccess = () => {
		// on success
		// close both modals
		handleCancellation()
		// if a success handler was provided
		if (onSuccess) onSuccess()
		// go to the previous URL
		if (goBackOnSuccess) goBack()
	}

	const handleDelete = async () => {
		if (isMulti && itemIDList) {
			for (const itemID of itemIDList) {
				await makeDeleteRequest(itemID)
			}
			handleDeleteSuccess()
		} else {
			const itemID = customItemID ?? itemTitle
			// make a single DELETE request to our API
			makeDeleteRequest(itemID)?.then(handleDeleteSuccess)
		}
	}

	// utils

	const { navHistory, setNavHistory } = useContext(Context)

	const router = useRouter()

	const getPreviousRoute = () => {
		// if navHistory is empty
		// go back to the home page
		if (navHistory.length < 2) return "/"
		// otherwise, go back to the last page
		return navHistory[navHistory.length - 2]
	}

	const goBack = () => {
		// clear the nav history of the current route
		// & of the one we're going back to
		setNavHistory(navHistory.slice(0, navHistory.length - 2))
		router.push(getPreviousRoute())
	}

	// render

	return (
		<>
			<AlertDialog
				open={open}
				onOpenChange={onOpenChange}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Supprimer un item</AlertDialogTitle>
						<AlertDialogDescription>
							Êtes-vous sûr(e) de vouloir supprimer <span className="font-semibold text-blue-600">{itemTitle}</span> ?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction
							className="bg-red-600 hover:shadow-red-600/20"
							onClick={handleYesClick}>
							Continuer
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			{/* <AlertDialog
				open={showConfirmationDialog}
				onOpenChange={setShowConfirmationDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirmation</AlertDialogTitle>
						<AlertDialogDescription>
							Confirmer la suppression de <span className="font-semibold text-blue-600">{itemTitle}</span> ?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={() => {
								setShowConfirmationDialog(false)
								onOpenChange(false)
							}}>
							Annuler
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-red-600 hover:shadow-red-600/20"
							onClick={handleDelete}>
							Supprimer
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog> */}
		</>
	)
}

export default DeleteDialog
