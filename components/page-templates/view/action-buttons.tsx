import DeleteDialog from "@components/modals/delete-dialog"
import PeriodicTaskHistoryModal from "@components/modals/periodic-task-history-modal"
import { Button, buttonVariants } from "@components/radix/button"
import { TO_BE_ASSIGNED_TAG, itemTypesPermissions } from "@conf/api/conf"
import { APPROVED_STATUS_ID, Fiche, FicheSystematique } from "@conf/api/data-types/fiche"
import { MySession } from "@conf/utility-types"
import { faClockRotateLeft, faEdit, faFileCirclePlus, faThumbTack, faTrashAlt } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import useAPIRequest from "@hook/useAPIRequest"
import { cn } from "@utils/tailwind"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

// this component handles the logic
// to decide which buttons to show the user on the view page
// & the logic for each button

interface Props {
	itemType: string
	itemData: any
	userIsInGroup: boolean
}

const ActionButtons = ({ itemType, itemData, userIsInGroup }: Props) => {
	const router = useRouter()

	// user privileges
	// impacts which action buttons to show

	const [hasFicheCreationPrivileges, setHasFicheCreationPrivileges] = useState(false)
	const [hasHistoryPrivileges, setHasHistoryPrivileges] = useState(false)
	const [hasItemPrivileges, setHasItemPrivileges] = useState(false)
	const [hasItemDeletionPrivileges, setHasItemDeletionPrivileges] = useState(false)
	const [showActionButtons, setShowActionButtons] = useState(false)

	// determine which permissions the user has

	const session = useSession().data as MySession | null
	const user = session?.user
	const userRole = session?.userRole

	useEffect(() => {
		if (!userRole) return
		setHasFicheCreationPrivileges(userRole.permissions.includes("fiches"))
		setHasHistoryPrivileges(userRole.permissions.includes("historique"))
		setHasItemPrivileges(userRole.permissions.includes(itemTypesPermissions[itemType]))
		setHasItemDeletionPrivileges(userRole.suppression.includes(itemTypesPermissions[itemType]))
	}, [session])

	useEffect(() => {
		setShowActionButtons(shouldShowFicheCreationButton() || shouldShowHistoryButton() || shouldShowEditButton() || shouldShowDeleteButton() ? true : false)
	}, [hasFicheCreationPrivileges, hasHistoryPrivileges, hasItemPrivileges, hasItemDeletionPrivileges])

	// action buttons handlers

	// create fiche item

	const getCreateFicheLink = () => `/create/fiches?itemType=${itemType}&itemId=${router.query.id}`

	// Fiche Systématique History button

	const [showHistoryModal, setShowHistoryModal] = useState(false)

	const handleHistoryClick = () => setShowHistoryModal(true)

	// Fiche Systématique Assign button

	const makeAPIRequest = useAPIRequest()

	const handleAssignClick = () => {
		if (!session) return

		if ((itemData as FicheSystematique).user_en_charge_id == user?.id) {
			// if the current user is already assigned to the task, unassign them
			// then reassign them to the task for it to be effective
			makeAPIRequest<FicheSystematique, void>(
				session,
				"put",
				"fiches_systematiques",
				`id/${(itemData as FicheSystematique).id}`,
				{
					user_en_charge_id: 1
				},
				() =>
					makeAPIRequest<FicheSystematique, void>(
						session,
						"put",
						"fiches_systematiques",
						`id/${(itemData as FicheSystematique).id}`,
						{
							user_en_charge_id: user?.id
						},
						() => router.reload()
					)
			)
		} else
			makeAPIRequest<FicheSystematique, void>(
				session,
				"put",
				"fiches_systematiques",
				`id/${(itemData as FicheSystematique).id}`,
				{
					user_en_charge_id: user?.id
				},
				() => router.reload()
			)
	}

	// edit current item

	const getEditLink = () => `/edit/${itemType.replace("_", "/")}/${router.query.id}`

	// delete current item

	// modal logic

	const [showDeleteModal, setShowDeleteModal] = useState(false)

	// show delete dialog

	const handleDeleteClick = () => setShowDeleteModal(true)

	// logic used to determine which buttons to show

	// only show the Fiche item creation button if:
	// - the user has the privileges to do so
	// - the current item type is a valid one
	//   to use as the subject of a Fiche item

	const ficheItemTypes = ["expositions", "elements"]

	const shouldShowFicheCreationButton = () => hasFicheCreationPrivileges && ficheItemTypes.includes(itemType)

	// only show the Fiche Systématique History button if:
	// - the user has the privileges to add to the history of a Fiche Systématique item
	// - the current item type is "fiches_systematiques"

	const shouldShowHistoryButton = () => hasHistoryPrivileges && itemType == "fiches_systematiques"

	// only show the edit button if:
	// - the user has edit privileges on the current item type
	// - the current item type is anything but "fiches"
	// -  or the current item type is "fiches" &:
	//      - the user is the author, a manager or was assigned the task
	//      - the status is anything but "Validée"

	const userCanEditFicheItem = () => {
		let ficheData = itemData as Fiche
		return (
			user &&
			userRole &&
			(userRole.permissions.includes("manage") || ficheData.auteur_id == user.id || ficheData.user_en_charge_id == user.id || userIsInGroup) &&
			ficheData.status_id != APPROVED_STATUS_ID
		)
	}

	const shouldShowEditButton = () => {
		return hasItemPrivileges && (itemType == "fiches" ? userCanEditFicheItem() : true)
	}

	// only show the delete button if:
	// - the user has deletion privileges on the current item type
	// - the current item type is not "fiches"
	// - the current item type is "fiches" &:
	//      - the user is the author & the status is anything but "validée"
	//      - the user is the author & a manager & the status is "validée"

	const userCanDeleteFicheItem = () => {
		let ficheData = itemData as Fiche
		return user && userRole && ficheData.auteur_id == user.id && (ficheData.status_id != APPROVED_STATUS_ID || userRole.permissions.includes("manage"))
	}

	const shouldShowDeleteButton = () => {
		return hasItemDeletionPrivileges || (itemType == "fiches" && userCanDeleteFicheItem())
	}

	// render

	return (
		<>
			{showActionButtons ? (
				<div className="flex flex-wrap items-center gap-4">
					{
						// determine whether the button should be visible
						shouldShowFicheCreationButton() ? (
							<Link
								className={cn(buttonVariants({ variant: "outline" }), "flex items-center gap-[8px]")}
								href={getCreateFicheLink()}>
								<FontAwesomeIcon icon={faFileCirclePlus} />
								Créer une fiche
							</Link>
						) : (
							<></>
						)
					}
					{
						// determine whether the button should be visible
						shouldShowHistoryButton() && (itemData as FicheSystematique).tags.includes(TO_BE_ASSIGNED_TAG) ? (
							<Button
								variant="outline"
								className={cn("flex items-center gap-[8px]", "border-emerald-600/20 text-emerald-600 hover:bg-emerald-600/10")}
								onClick={handleAssignClick}>
								<FontAwesomeIcon icon={faThumbTack} />
								Me l&apos;attribuer
							</Button>
						) : (
							<></>
						)
					}
					{
						// determine whether the button should be visible
						shouldShowHistoryButton() ? (
							<Button
								variant="outline"
								className={cn("flex items-center gap-[8px]", "border-emerald-600/20 text-emerald-600 hover:bg-emerald-600/10")}
								onClick={handleHistoryClick}>
								<FontAwesomeIcon icon={faClockRotateLeft} />
								Historique
							</Button>
						) : (
							<></>
						)
					}
					{
						// determine whether the button should be visible
						shouldShowEditButton() ? (
							<Link
								className={cn(buttonVariants({ variant: "outline" }), "flex items-center gap-[8px]")}
								href={getEditLink()}>
								<FontAwesomeIcon icon={faEdit} />
								Modifier
							</Link>
						) : (
							<></>
						)
					}
					{
						// determine whether the button should be visible
						shouldShowDeleteButton() ? (
							<Button
								variant="outline"
								className={cn("flex items-center gap-[8px]", "border-red-600/20 text-red-600 hover:bg-red-600/10")}
								onClick={handleDeleteClick}>
								<FontAwesomeIcon icon={faTrashAlt} />
								Supprimer
							</Button>
						) : (
							<></>
						)
					}
					<DeleteDialog
						open={showDeleteModal}
						onOpenChange={setShowDeleteModal}
						itemType={itemType}
						itemTitle={itemData.nom}
						customItemID={itemType == "fiches" || itemType == "fiches_systematiques" ? `id/${(itemData as Fiche).id}` : undefined}
					/>
					{shouldShowHistoryButton() ? (
						<PeriodicTaskHistoryModal
							isVisible={showHistoryModal}
							closeModal={() => setShowHistoryModal(false)}
							task={itemData as FicheSystematique}
						/>
					) : (
						<></>
					)}
				</div>
			) : (
				<></>
			)}
		</>
	)
}

export default ActionButtons
