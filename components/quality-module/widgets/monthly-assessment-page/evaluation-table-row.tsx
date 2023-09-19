import { TableCell, TableRow } from "@components/radix/table";
import { Evaluation } from "@conf/api/data-types/quality-module";
import { Element } from "@conf/api/data-types/element";
import { MySession } from "@conf/utility-types";
import useAPIRequest from "@hook/useAPIRequest";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faEllipsisVertical, faEye, faLink, faTrash } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@utils/tailwind";
import DropdownMenu from "@components/radix/dropdown-menu";
import { Button } from "@components/radix/button";
import ContextMenu from "@components/radix/context-menu";
import { IconProp } from "@fortawesome/fontawesome-svg-core";


interface EvaluationRowProps {
    evaluation: Evaluation;
    className?: string;
}

interface EvaluationRowData {
    thematique: string;
    exposition: string;
    evaluateur: string;
    element: string;
}

const menuOptions: {
    label: string;
    value: string;
    icon: IconProp;
    status?: "danger" | "warning" | "success";
}[] = [
    {
        label: "Modifier",
        value: "edit",
        icon: faEdit
    },
    {
        label: "Ouvrir",
        value: "open",
        icon: faEye
    },
    {
        label: "Supprimer",
        value: "delete",
        icon: faTrash,
        status: "danger"
    }
]


interface ContextDropdownProps {
    className?: string;
}

const ContextDropdown = (
    {
        className
    }: ContextDropdownProps
) => (
    <ContextMenu
        className={className}
        options={menuOptions}
        onSelect={() => {}}
    />
)

const EvaluationTableRow = (
    {
        evaluation,
        className
    }: EvaluationRowProps
) => {


    const router = useRouter()

    // get the row's data

    const [rowData, setRowData] = useState<EvaluationRowData | null>(null)

    // make the request to get the row's data from the API

    const makeAPIRequest = useAPIRequest()
    const session = useSession().data as MySession | null

    const getRowData = async () => {
        if(!session) return

        const thematique = await makeAPIRequest<any, string>(
            session,
            'get',
            'thematiques',
            `id/${evaluation.thematique_id}`,
            undefined,
            res => res.data.nom
        )

        if(!thematique || thematique instanceof Error) return

        const element = await makeAPIRequest<Element, Element>(
            session,
            'get',
            'elements',
            `id/${evaluation.element_id}`,
            undefined,
            res => res.data
        )

        if(!element || element instanceof Error) return
            
        const exposition = await makeAPIRequest<any, string>(
            session,
            'get',
            'expositions',
            `id/${element.exposition_id}`,
            undefined,
            res => res.data.nom
        )

        if(!exposition || exposition instanceof Error) return

        const evaluateur = await makeAPIRequest<any, string>(
            session,
            'get',
            'users',
            `id/${evaluation.user_id}`,
            undefined,
            res => `${res.data.prenom} ${res.data.nom}`
        )

        if(!evaluateur || evaluateur instanceof Error) return

        setRowData({
            thematique,
            exposition,
            evaluateur,
            element: element.nom
        })

    }

    useEffect(() => {
        if(!session) return
        getRowData()
    }, [session, evaluation])


    // render

    return rowData ? (
        <TableRow className={
            cn(
                "flex items-center max-md:p-[16px] max-md:flex-col max-md:items-start max-md:gap-4",
                className
            )
        }>
            <TableCell className="flex-1 w-full flex flex-row items-start justify-between gap-4 max-md:p-0">
                <div className="flex flex-col gap-4">
                    <span className="text-sm font-medium text-primary/80 max-md:text-base">{rowData.thematique}</span>
                    <span className="text-xs text-primary/60 max-md:text-sm">{rowData.exposition}</span>
                </div>
                <ContextDropdown className="md:hidden" />
            </TableCell>
            <TableCell 
                onClick={() => router.push(`/view/elements/${evaluation.element_id}`)}
                className="flex-1 max-md:p-0 text-secondary hover:underline cursor-pointer">
                <Link
                    className="w-full h-full flex items-center gap-[16px]"
                    href={`/view/elements/${evaluation.element_id}`}>
                    {rowData.element}
                </Link>
            </TableCell>
            <TableCell className="flex-1 max-md:p-0 max-md:text-primary/60">{rowData.evaluateur}</TableCell>
            <TableCell className="flex-1 max-md:p-0 max-md:text-primary/60">{(new Date(evaluation.date_rendu)).toLocaleDateString("fr-fr")}</TableCell>
            <TableCell className="max-md:hidden">
                <ContextDropdown />
            </TableCell>
        </TableRow>
    ) : <></>
}

export default EvaluationTableRow