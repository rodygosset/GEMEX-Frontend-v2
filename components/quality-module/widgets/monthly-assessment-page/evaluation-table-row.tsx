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
import { faEdit, faEllipsisVertical, faEye, faLink, faThumbsUp, faTrash } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@utils/tailwind";
import DropdownMenu from "@components/radix/dropdown-menu";
import { Button } from "@components/radix/button";
import ContextMenu from "@components/radix/context-menu";
import { IconProp } from "@fortawesome/fontawesome-svg-core";


interface Props {
    evaluation: Evaluation;
    className?: string;
    onDelete: (evaluationTitle: string) => void;
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
    hidden: (evaluation: Evaluation) => boolean;
}[] = [
    {
        label: "Valider",
        value: "approve",
        icon: faThumbsUp,
        status: "success",
        hidden: evaluation => evaluation.note === null || evaluation.approved
    },
    {
        label: "Modifier",
        value: "edit",
        icon: faEdit,
        hidden: () => false
    },
    {
        label: "Ouvrir",
        value: "open",
        icon: faEye,
        hidden: () => false
    },
    {
        label: "Supprimer",
        value: "delete",
        icon: faTrash,
        status: "danger",
        hidden: () => false
    }
]


interface ContextDropdownProps {
    className?: string;
    evaluation: Evaluation;
    onSelect: (value: string) => void;
}

const ContextDropdown = (
    {
        className,
        evaluation,
        onSelect
    }: ContextDropdownProps
) => (
    <ContextMenu
        className={className}
        options={menuOptions.filter(option => !option.hidden(evaluation))}
        onSelect={onSelect}
    />
)

const EvaluationTableRow = (
    {
        evaluation,
        className,
        onDelete,
    }: Props
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

    // handlers

    const onContextSelect = (value: string) => {
        if(!rowData) return
        switch(value) {
            case "edit":
                // todo
                break;
            case "open":
                // todo
                break;
            case "delete":
                onDelete(`l'évaluation "${rowData.thematique} - ${rowData.element}" attribuée à ${rowData.evaluateur}`)
                break;
        }
    }


    // render

    return rowData ? (
        <TableRow className={
            cn(
                "flex items-center max-md:p-[16px] max-md:flex-col max-md:items-start max-md:gap-4",
                className
            )
        }>
            <TableCell className="flex-1 w-full flex flex-row items-start justify-between gap-4 max-md:p-0">
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-primary max-md:text-base">{rowData.thematique}</span>
                    <span className="text-xs text-primary/80 max-md:text-sm">{rowData.exposition}</span>
                </div>
                <ContextDropdown className="md:hidden" onSelect={onContextSelect} evaluation={evaluation} />
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
                <ContextDropdown onSelect={onContextSelect} evaluation={evaluation} />
            </TableCell>
        </TableRow>
    ) : <></>
}

export default EvaluationTableRow