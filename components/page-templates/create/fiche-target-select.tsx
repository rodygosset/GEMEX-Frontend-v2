import Button from "@components/button"
import FicheTargetSelectModal from "@components/modals/fiche-target-select-modal"
import { itemTypes } from "@conf/api/search"
import { MySession } from "@conf/utility-types"
import useAPIRequest from "@hook/useAPIRequest"
import styles from "@styles/page-templates/create/fiche-target-select.module.scss"
import { itemTypetoAttributeName, toSingular } from "@utils/general"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface Props {
	currentItemType: string
	value: number
	isInErrorState?: boolean
	onChange: (fieldName: string, value: any) => void
}

const FicheTargetSelect = ({ currentItemType, value, isInErrorState, onChange }: Props) => {
	// state

	const [selectedItemLabel, setSelectedItemLabel] = useState("")

	// get the selected item's label once it's been set
	// by making a request to our API

	const makeAPIRequest = useAPIRequest()

	const session = useSession().data as MySession | null

	const getLabel = async (itemType: string, id: number) => {
		if (!session) return

		return makeAPIRequest<any, string>(session, "get", itemType, `id/${id}`, undefined, (res) => res.data.nom)
	}

	useEffect(() => {
		if (value == null || value == undefined) {
			setSelectedItemLabel("")
			return
		}
		// get the label for the current item
		// & account for errors by making sure we got back a string
		getLabel(currentItemType, value).then((label) => (typeof label == "string" ? setSelectedItemLabel(label) : null))
	}, [value, currentItemType])

	// item select modal logic

	const [showModal, setShowModal] = useState(false)

	// when an item of a specific item type is selected
	// update the corresponding field in the form
	// & clear the other form that have to do with the fiche's target item

	const targetItemTypes = ["expositions", "elements"]

	const handleSelect = (itemType: string, id: number) => {
		if (!targetItemTypes.includes(itemType)) return
		let attributeName = ""
		for (const targetItemType of targetItemTypes) {
			attributeName = itemTypetoAttributeName(targetItemType)
			// if targetItemType is itemType, set the id
			// otherwise set field to null
			onChange(attributeName, targetItemType == itemType ? id : 0)
		}
	}

	// utils

	const getItemTypeLabel = () => {
		const label = itemTypes.find((type) => type.value == currentItemType)?.label
		return label ? label : ""
	}

	const getClassNames = () => {
		let classNames = styles.inputContainer
		classNames += isInErrorState ? " " + styles.error : ""
		return classNames
	}

	// render

	return (
		<>
			<div className={getClassNames()}>
				{selectedItemLabel ? (
					<p>
						<span className={styles.itemLabel}>{selectedItemLabel}</span>
						<span>{toSingular(getItemTypeLabel())}</span>
					</p>
				) : (
					<p>Sélectionner...</p>
				)}
				<Button onClick={() => setShowModal(true)}>Choisir</Button>
			</div>
			<FicheTargetSelectModal
				isVisible={showModal}
				closeModal={() => setShowModal(false)}
				onSelect={handleSelect}
			/>
		</>
	)
}

export default FicheTargetSelect
