import Button from "@components/button";
import ModalContainer from "../modal-container";
import { Thematique } from "@conf/api/data-types/quality-module";
import Image from "next/image";
import ContextMenu from "@components/radix/context-menu";
import { faCircle, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment } from "react";


interface Props {
    thematique?: Thematique;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const ThematiqueViewModal = (
    {
        thematique,
        isOpen,
        onClose,
        onEdit,
        onDelete
    }: Props
) => {

    // handlers

    const handleEdit = () => {
        onClose()
        onEdit()
    }

    const handleDelete = () => {
        onClose()
        onDelete()
    }


    // render

    return (
        <ModalContainer isVisible={isOpen}>
            <section
                className="flex flex-col gap-8 min-w-[400px] max-w-3xl overflow-auto bg-white rounded-2xl p-[32px]">
                    {
                        thematique ?
                        <div className="w-full flex flex-col gap-8">
                            <div className="w-full flex flex-row gap-4 items-start">
                                <div className="flex-1 flex flex-col gap-2">
                                    <h3 className="text-xl font-medium text-blue-600">{thematique.nom}</h3>
                                    <p className="flex flex-col">
                                        <span className="text-sm font-normal text-blue-600/80">
                                            À évaluer
                                        {
                                            thematique.periodicite > 1 ?
                                            ` tous les ${thematique.periodicite} mois` :
                                            ` tous les mois`
                                        }
                                        </span>
                                        <span className="text-sm font-normal text-purple-600/80">
                                            Pondération à {thematique.ponderateur}
                                        </span>
                                    </p>
                                </div>
                                <ContextMenu 
                                    options={[
                                        {
                                            label: "Modifier",
                                            value: "edit",
                                            icon: faEdit
                                        },
                                        {
                                            label: "Supprimer",
                                            value: "delete",
                                            icon: faTrash,
                                            status: "danger"
                                        }
                                    ]}
                                    onSelect={option => {
                                        if (option === "edit") handleEdit()
                                        if (option === "delete") handleDelete()
                                    }}
                                />
                            </div>
                            <div className="w-full h-[1px] bg-blue-600/20 my-2"></div>
                            <div className="flex flex-col w-full">
                                <h4 className="text-xs font-medium text-blue-600/60 uppercase tracking-wider">Description</h4>
                                <p className="text-base font-normal text-blue-600">{thematique.description}</p>
                            </div>
                            <div className="flex flex-col w-full">
                                <h4 className="text-xs font-medium text-blue-600/60 uppercase tracking-wider">Question générale</h4>
                                <p className="text-base font-normal text-blue-600">{thematique.question}</p>
                                <span className="text-sm font-normal text-purple-600/80">Pondération à {thematique.question_ponderateur}</span>
                            </div>
                            <div className="w-full h-[1px] bg-blue-600/20 my-2"></div>
                            <div className="flex flex-col w-full gap-4">
                                <h4 className="text-xs font-medium text-blue-600/60 uppercase tracking-wider">Questions spécifiques</h4>
                                {
                                    thematique.questions.length > 0 ?
                                    <ul className="flex flex-col gap-4">
                                        {
                                            thematique.questions.map((question, index) => (
                                                <Fragment key={question.id}>
                                                    <li className="flex flex-col">
                                                        <p className="flex flex-row items-center">
                                                        {
                                                            question.titre ? 
                                                            <span className="text-sm font-normal text-blue-600/60">{question.titre}</span> :
                                                            <></>
                                                        }
                                                        {
                                                            question.optional ?
                                                            <>
                                                                <FontAwesomeIcon icon={faCircle} className="text-blue-600/60 mx-2 text-[0.3rem]" />
                                                                <span className="text-sm font-normal text-blue-600/60">Optionnelle</span>
                                                            </>
                                                            :
                                                            <span className="text-sm font-normal text-blue-600/60">Obligatoire</span>
                                                        }
                                                        </p>
                                                        <p className="text-base font-normal text-blue-600">{question.question}</p>
                                                    </li>
                                                    {
                                                        index !== thematique.questions.length - 1 ?
                                                        <div className="w-full h-[1px] bg-blue-600/20 my-2"></div> :
                                                        <></>
                                                    }
                                                </Fragment>
                                            ))
                                        }
                                    </ul>
                                    :
                                    <p className="text-base font-normal text-blue-600/80">Aucune question spécifique</p>
                                }
                            </div>
                        </div>
                        :
                        // show the no results image if no thematique is selected
                        <div className="h-full w-full flex flex-col items-center justify-center gap-4">
                            <div className="w-[300px] relative aspect-[1.226]">
                                <Image 
                                    quality={100}
                                    src={'/images/no-results-illustration.svg'} 
                                    alt={"Aucun résultat."} 
                                    priority
                                    fill
                                    style={{ 
                                        objectFit: "contain", 
                                        top: "auto"
                                    }}
                                />
                            </div>
                            <p className="text-base font-normal text-blue-600/60">Aucune thématique sélectionnée</p>
                        </div>
                    }
                    <Button
                        fullWidth
                        role="secondary"
                        onClick={onClose}>
                        Fermer
                    </Button>
            </section>
        </ModalContainer>
    )
}

export default ThematiqueViewModal