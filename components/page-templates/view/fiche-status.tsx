import styles from "@styles/page-templates/view/fiche-status.module.scss"
import { APPROVED_STATUS_ID, DONE_STATUS_ID, Fiche, INIT_STATUS_ID, REQUEST_STATUS_ID } from "@conf/api/data-types/fiche"
import { MySession } from "@conf/utility-types"
import { useSession } from "next-auth/react"
import { faCheck, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons"
import useAPIRequest from "@hook/useAPIRequest"
import { useRouter } from "next/router"
import { cn } from "@utils/tailwind"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "@components/radix/button"

// this component allows the user to visualize
// & interact with (authorized users only) the status of a Fiche object
// it follows the Fiche lifecycle

interface Props {
	ficheData: Fiche
	status: {
		label: string
		id: number
	}
}

const FicheStatus = ({ ficheData, status }: Props) => {
	// lifecycle
	// 1. Demande => can be accepted or closed by a group manager only
	// 2. Ouverte => can be marked as in progress ("en cours")
	//               by the author or the user in charge of the task
	// 3. En cours => can be marked as done ("terminée")
	//                by the author, the user in charge of the task or a manager
	// 4. Terminée => can be marked as approved ("validée") / invalidated ("en cours")
	//                by a manager
	// 5. Validée => status can't be changed

	// determine which permissions the user has

	const session = useSession().data as MySession | null
	const user = session?.user
	const userRole = session?.userRole

	const userIsManager = userRole && userRole.permissions.includes("manage") ? true : false

	// utils

	const getClassName = () => {
		switch (status.id) {
			case REQUEST_STATUS_ID:
				return styles.warning
			case DONE_STATUS_ID:
				return styles.progress
			case APPROVED_STATUS_ID:
				return styles.success
			default:
				return styles.primary
		}
	}

	// whether the user has anything to do with this Fiche object
	// => is he the author, in charge of the work to be done or a manager

	const userIsInvolved = user && userRole && (userIsManager || ficheData.auteur_id == user.id || ficheData.user_en_charge_id == user.id)

	const shouldAllowAcceptOrClose = () => status.id == REQUEST_STATUS_ID && userIsManager

	const shouldAllowMarkAsInit = () => status.id == DONE_STATUS_ID && userIsInvolved

	const shouldAllowMarkAsDone = () => status.id == INIT_STATUS_ID && userIsInvolved

	const shouldAllowMarkAsApproved = () => status.id == DONE_STATUS_ID && userIsManager

	// utility function to update the status through an API request

	const makeAPIRequest = useAPIRequest()

	const router = useRouter()

	// reload the page once the status has been updated

	const refresh = () => router.push(router.asPath)

	const updateStatus = (statusId: number) => {
		if (!session) return

		makeAPIRequest(
			session,
			"put",
			"fiches",
			`id/${ficheData.id}`,
			{
				status_id: statusId
			},
			() => refresh()
		)
	}

	// action handlers

	const handleAccept = () => updateStatus(INIT_STATUS_ID)

	const handleClose = () => {
		// todo
	}

	const handleMarkAsDone = () => updateStatus(DONE_STATUS_ID)

	const handleMarkAsApproved = () => updateStatus(APPROVED_STATUS_ID)

	// render

	// buttons shown are different depending on the current status

	return (
		<div className="w-full flex flex-wrap gap-[16px]">
			<span
				className={cn(
					"text-sm text-blue-600",
					"px-[16px] py-[8px] rounded-full border border-blue-600/20",
					"hover:bg-blue-600/10 transition-all duration-300 ease-in-out cursor-default",
					status.id == REQUEST_STATUS_ID ? "text-yellow-600 border-yellow-600/20 hover:bg-yellow-600/10" : "",
					status.id == DONE_STATUS_ID ? "text-purple-600 border-purple-600/20 hover:bg-purple-600/10" : "",
					status.id == APPROVED_STATUS_ID ? "text-emerald-600 border-emerald-600/20 hover:bg-emerald-600/10" : ""
				)}>
				{status.label}
			</span>
			{shouldAllowAcceptOrClose() ? (
				<Button
					variant="outline"
					className="flex items-center gap-[8px] rounded-full"
					onClick={handleAccept}>
					<FontAwesomeIcon icon={faCheck} />
					Accepter
				</Button>
			) : (
				<></>
			)}
			{shouldAllowAcceptOrClose() ? (
				<Button
					variant="outline"
					className={cn(
						"flex items-center gap-[8px]",
						"rounded-full text-red-600 border border-red-600/20",
						"hover:bg-red-600/10 transition-all duration-300 ease-in-out"
					)}
					onClick={handleClose}>
					<FontAwesomeIcon icon={faXmark} />
					Fermer
				</Button>
			) : (
				<></>
			)}
			{shouldAllowMarkAsInit() ? (
				<Button
					variant="outline"
					className={cn("flex items-center gap-[8px]", "rounded-full border border-blue-600/20")}
					onClick={handleAccept}>
					<FontAwesomeIcon icon={faSpinner} />
					Marquer en cours
				</Button>
			) : (
				<></>
			)}
			{shouldAllowMarkAsDone() ? (
				<Button
					variant="outline"
					className={cn(
						"flex items-center gap-[8px]",
						"rounded-full text-purple-600 border border-purple-600/20",
						"hover:bg-purple-600/10 transition-all duration-300 ease-in-out"
					)}
					onClick={handleMarkAsDone}>
					<FontAwesomeIcon icon={faCheck} />
					Marquer comme fait
				</Button>
			) : (
				<></>
			)}
			{shouldAllowMarkAsApproved() ? (
				<Button
					variant="outline"
					className={cn(
						"flex items-center gap-[8px]",
						"rounded-full text-emerald-600 border border-emerald-600/20",
						"hover:bg-emerald-600/10 transition-all duration-300 ease-in-out"
					)}
					onClick={handleMarkAsApproved}>
					<FontAwesomeIcon icon={faCheck} />
					Valider
				</Button>
			) : (
				<></>
			)}
		</div>
	)
}

export default FicheStatus
