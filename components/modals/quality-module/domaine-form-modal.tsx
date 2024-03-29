import Button from "@components/button"
import ModalContainer from "../modal-container"
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons"
import FieldContainer from "@components/form-elements/field-container"
import Label from "@components/form-elements/label"
import TextInput from "@components/form-elements/text-input"
import { useEffect, useState } from "react"
import useAPIRequest from "@hook/useAPIRequest"
import { useSession } from "next-auth/react"
import { MySession } from "@conf/utility-types"
import { Domaine } from "@conf/api/data-types/quality-module"

interface Props {
	domaine?: Domaine
	isOpen: boolean
	onClose: () => void
	onSubmit: (d: Domaine) => void
}

const DomaineFormModal = ({ domaine, isOpen, onClose, onSubmit }: Props) => {
	const [nom, setNom] = useState<string>(domaine?.nom || "")
	const [description, setDescription] = useState<string>(domaine?.description || "")

	const [errorFields, setErrorFields] = useState<string[]>([])

	// keep the form fields up to date with the domaine prop

	useEffect(() => {
		setNom(domaine?.nom || "")
		setDescription(domaine?.description || "")
	}, [isOpen, domaine])

	// handlers

	const handleClose = () => {
		setNom("")
		setDescription("")
		onClose()
	}

	const makeAPIRequest = useAPIRequest()
	const session = useSession().data as MySession | null

	const handleSubmit = () => {
		if (!session) return

		if (domaine) {
			// update the domaine if it already exists

			if (nom === domaine.nom && description === domaine.description) {
				handleClose()
				return
			}

			const data = {
				...(nom !== domaine.nom && { new_nom: nom }),
				...(description !== domaine.description && { description })
			}

			makeAPIRequest<Domaine, void>(session, "put", "domaines", domaine.nom, data, (res) => {
				onSubmit(res.data)
				handleClose()
			})
		} else {
			if (!nom) {
				setErrorFields([...errorFields, "nom"])
			}

			// make the request to create the domaine if it doesn't exist

			makeAPIRequest<Domaine, void>(
				session,
				"post",
				"domaines",
				undefined,
				{
					nom,
					description
				},
				(res) => {
					onSubmit(res.data)
					handleClose()
				}
			)
		}
	}

	// render

	return (
		<ModalContainer isVisible={isOpen}>
			<form
				className="flex flex-col gap-8 min-w-[300px] overflow-auto bg-white rounded-2xl p-[32px]"
				name="domaine-form">
				<h3 className="text-xl font-bold text-blue-600 flex-1">{domaine ? "Modifier le domaine d'évaluation" : "Nouveau domaine d'évaluation"}</h3>
				<div className="w-full h-[1px] bg-blue-600/10"></div>
				<FieldContainer fullWidth>
					<Label>Nom</Label>
					<TextInput
						fullWidth
						placeholder="Fonctionnement, ..."
						currentValue={nom}
						isInErrorState={errorFields.includes("nom")}
						onChange={(n) => setNom(n)}
					/>
				</FieldContainer>
				<FieldContainer fullWidth>
					<Label>Description</Label>
					<TextInput
						isTextArea
						fullWidth
						placeholder="Description du domaine d'évaluation.."
						currentValue={description}
						onChange={(d) => setDescription(d)}
					/>
				</FieldContainer>
				<div className="flex flex-row gap-4 w-full">
					<Button
						fullWidth
						role="secondary"
						onClick={handleClose}>
						Annuler
					</Button>
					<Button
						fullWidth
						icon={faFloppyDisk}
						onClick={handleSubmit}>
						Sauver
					</Button>
				</div>
			</form>
		</ModalContainer>
	)
}

export default DomaineFormModal
