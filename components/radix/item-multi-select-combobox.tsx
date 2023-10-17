import { SelectOption } from "@utils/react-select/types"
import MultiSelectCombobox from "./multi-select-combobox"
import { useEffect, useState } from "react"
import useAPIRequest from "@hook/useAPIRequest"
import { MySession } from "@conf/utility-types"
import { useSession } from "next-auth/react"
import { AxiosResponse } from "axios"
import { capitalizeEachWord } from "@utils/general"

interface Props {
	className?: string
	name?: string
	itemType: string
	selected?: number[]
	selectByLabel?: boolean
	searchParams?: any
	onSelect: (option: SelectOption[]) => void
}

const ItemMultiSelectCombobox = ({ className, name, itemType, selected, selectByLabel, searchParams, onSelect }: Props) => {
	// state

	const [options, setOptions] = useState<SelectOption[]>([])

	const [isLoading, setIsLoading] = useState(true)

	// Fetch the data from the API
	// & convert it into a list of options

	const makeAPIRequest = useAPIRequest()

	const session = useSession().data as MySession | null

	useEffect(() => {
		if (!session) return

		setIsLoading(true)

		// start with making a request to the API

		const handleReqSucess = (res: AxiosResponse<any[]>) => {
			// convert the array of objects into an array of select options

			if (!Array.isArray(res.data)) {
				return
			}

			// get the object property we'll use as the label
			let mainAttr = ""
			if ("username" in res.data[0]) {
				mainAttr = "username"
			} else if ("titre" in res.data[0]) {
				mainAttr = "titre"
			} else if ("nom" in res.data[0]) {
				mainAttr = "nom"
			} else {
				mainAttr = "id"
			}

			const selectOptions = res.data.map((item) => {
				// if our options are users
				// display their full name
				let optionLabel: string = item[mainAttr]
				if (mainAttr == "username") {
					optionLabel = capitalizeEachWord(item["prenom"] + " " + item["nom"])
				}
				return { value: item.id, label: optionLabel }
			})

			setOptions(selectOptions)

			setIsLoading(false)
		}

		// make our API request

		searchParams
			? makeAPIRequest(session, "post", itemType, "search/", searchParams, handleReqSucess, () => setIsLoading(false))
			: makeAPIRequest(session, "get", itemType, undefined, undefined, handleReqSucess, () => setIsLoading(false))
	}, [session, searchParams])

	useEffect(() => {
		if (isLoading || !selected) return

		// if we have selected items
		// make sure they are in the options
		// otherwise filter them out

		onSelect(
			selected
				.filter((item) => options.find((option) => option.value == item))
				.map((item) => options.find((option) => option.value == item) as SelectOption)
		)
	}, [options])

	// render

	return (
		<MultiSelectCombobox
			name={name}
			className={className}
			options={options}
			selected={
				isLoading
					? []
					: selected?.map(
							(item) =>
								options.find((o) => (selectByLabel ? o.label == (item as any as string) : o.value == item)) ?? {
									value: item,
									label: "Item non existant"
								}
					  )
			}
			onSelect={onSelect}
		/>
	)
}

export default ItemMultiSelectCombobox
