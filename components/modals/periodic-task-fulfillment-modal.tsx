import Button from "@components/button"
import DateInput from "@components/form-elements/date-input"
import TextInput from "@components/form-elements/text-input"
import { FicheSystematique, HistoriqueFicheSystematique } from "@conf/api/data-types/fiche"
import { getUserFullName, User } from "@conf/api/data-types/user"
import { faCheck } from "@fortawesome/free-solid-svg-icons"
import useAPIRequest from "@hook/useAPIRequest"
import styles from "@styles/components/modals/periodic-task-fulfillment-modal.module.scss"
import { toISO } from "@utils/general"
import { useState } from "react"
import ModalContainer from "./modal-container"
import { useSession } from "next-auth/react"
import { MySession } from "@conf/utility-types"

interface Props {
	isVisible: boolean
	closeModal: () => void
	user: User
	task: FicheSystematique
	notBefore?: Date
	onSubmit: () => void
}

const PeriodicTaskFulfillmentModal = ({ isVisible, closeModal, user, task, notBefore, onSubmit }: Props) => {
	// state

	const [date, setDate] = useState(new Date())

	const [comment, setComment] = useState("")

	// handlers

	// post form data to the API

	const makeAPIRequest = useAPIRequest()

	const { data, status } = useSession()

	const session = data as MySession | null

	const handleSubmit = () => {
		if (!session) return

		makeAPIRequest<HistoriqueFicheSystematique, void>(
			session,
			"post",
			"historiques_fiches_systematiques",
			undefined,
			{
				fiche_id: task.id,
				date: toISO(date),
				commentaire: comment
			},
			// run the provided submit handler
			// if the request succeeds
			() => {
				closeModal()
				setDate(new Date())
				setComment("")
				onSubmit()
			}
		)
	}

	// render

	return (
		<ModalContainer isVisible={isVisible}>
			<section className={styles.modal}>
				<h4>
					Réalisation <span>&quot;{task.nom}&quot;</span>
				</h4>
				<p className={styles.userName}>{getUserFullName(user)}</p>
				<form>
					<DateInput
						name="task_fulfillment_date"
						onChange={setDate}
						value={date}
						minDate={notBefore}
						maxDate={new Date()}
						showLocaleDate
					/>
					<TextInput
						name="task_fulfillment_comment"
						onChange={setComment}
						currentValue={comment}
						fullWidth
						isTextArea
						placeholder="Apportez des précisions..."
					/>
					<div className={styles.buttonsContainer}>
						<Button
							role="secondary"
							fullWidth
							onClick={closeModal}>
							Annuler
						</Button>
						<Button
							icon={faCheck}
							fullWidth
							onClick={handleSubmit}>
							Soumettre
						</Button>
					</div>
				</form>
			</section>
		</ModalContainer>
	)
}

export default PeriodicTaskFulfillmentModal
