import { Fichier } from "@conf/api/data-types/fichier"
import { useEffect, useState } from "react"
import FileCard from "@components/cards/file-card"
import useAPIRequest from "@hook/useAPIRequest"
import { itemTypetoAttributeName } from "@utils/general"
import { MySession } from "@conf/utility-types"
import { useSession } from "next-auth/react"

interface Props {
	itemType: string
	itemData: any
}

const ViewFiles = ({ itemType, itemData }: Props) => {
	// state

	const [fichiers, setFichiers] = useState<Fichier[]>([])

	// get all the files associated to the current item
	// by making a request to our backend API

	const makeAPIRequest = useAPIRequest()

	const session = useSession().data as MySession | null

	const getFiles = () => {
		if (!session) return

		makeAPIRequest<Fichier[], void>(
			session,
			"post",
			"fichiers",
			"search/",
			{
				// compute the name of the search param using the item type
				[itemTypetoAttributeName(itemType)]: itemData.id
			},
			(res) => setFichiers(res.data)
		)
	}

	useEffect(() => getFiles(), [itemType, itemData])

	// render

	return (
		<div className="flex flex-col items-stretch gap-[16px] pb-[16px]">
			<span className="text-base font-medium text-blue-600">Fichiers</span>
			{fichiers.length > 0 ? (
				<ul className="flex flex-wrap gap-[16px]">
					{fichiers.map((file) => (
						<FileCard
							key={file.nom}
							file={file}
						/>
					))}
				</ul>
			) : (
				<span className="text-sm font-normal text-blue-600/60 p-[16px] rounded-[8px] border border-blue-600/20">
					Aucun fichier n'est associé à cet item
				</span>
			)}
		</div>
	)
}

export default ViewFiles
