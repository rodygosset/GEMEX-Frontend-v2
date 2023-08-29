import Button from "@components/button";
import ModalContainer from "../modal-container"
import { faEdit, faFloppyDisk, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import FieldContainer from "@components/form-elements/field-container";
import Label from "@components/form-elements/label";
import TextInput from "@components/form-elements/text-input";
import NumericField from "@components/form-elements/numeric-field";
import { QuestionCreate } from "@conf/api/data-types/quality-module";
import QuestionFormModal from "./question-form-modal";


interface Props {
    isOpen: boolean;
    domaineId: number;
    onClose: () => void;
    onSubmit: () => void;
}

const ThematiqueFormModal = (
    {
        isOpen,
        domaineId,
        onClose,
        onSubmit
    }: Props
) => {

    // form state

    const [nom, setNom] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [periodicite, setPeriodicite] = useState<number>(1)
    const [ponderateur, setPonderateur] = useState<number>(10)
    const [question, setQuestion] = useState<string>("")
    const [questionPonderateur, setQuestionPonderateur] = useState<number>(10)

    const [questions, setQuestions] = useState<QuestionCreate[]>([])

    const [errorFields, setErrorFields] = useState<string[]>([])


    // manage modals & forms

    const [questionModalIsOpen, setQuestionModalIsOpen] = useState<boolean>(false)
    const [questionEditModalIsOpen, setQuestionEditModalIsOpen] = useState<boolean>(false)

    const [selectedQuestionId, setSelectedQuestionId] = useState<number>(0)


    // utils

    const clearFormFields = () => {
        setNom("")
        setDescription("")
        setPeriodicite(1)
        setPonderateur(10)
        setQuestion("")
        setQuestionPonderateur(10)
    }


    // handlers

    const handleClose = () => {
        clearFormFields()
        onClose()
    }

    const handleSubmit = () => {
        onSubmit()
    }

    // render

    return (
        <>
            <ModalContainer isVisible={isOpen}>
                <form
                    className="flex flex-col gap-8 min-w-[500px] overflow-auto bg-white rounded-2xl p-[32px]"
                    name="thematique-form">
                    <h3 className="text-xl font-bold text-primary flex-1">Nouvelle thématique</h3>
                    <div className="w-full h-[1px] bg-primary/10"></div>
                    <FieldContainer fullWidth>
                        <Label>Nom</Label>
                        <TextInput
                            fullWidth
                            placeholder="Hygiène, Propreté, ..."
                            currentValue={nom}
                            isInErrorState={errorFields.includes("nom")}
                            onChange={n => setNom(n)}
                        />
                    </FieldContainer>
                    <FieldContainer fullWidth>
                        <Label>Description</Label>
                        <TextInput
                            isTextArea
                            fullWidth
                            placeholder="Description de la thématique d'évaluation..."
                            currentValue={description}
                            onChange={d => setDescription(d)}
                        />
                    </FieldContainer>
                    <div className="w-full flex flex-row gap-4">
                        <FieldContainer fullWidth>
                            <Label>Périodicité en mois</Label>
                            <NumericField
                                fullWidth
                                min={1}
                                max={12}
                                value={periodicite}
                                onChange={p => setPeriodicite(p)}
                            />
                        </FieldContainer>
                        <FieldContainer fullWidth>
                            <Label>Pondérateur</Label>
                            <NumericField
                                fullWidth
                                min={1}
                                value={ponderateur}
                                onChange={p => setPonderateur(p)}
                            />
                        </FieldContainer>
                    </div>
                    <FieldContainer fullWidth>
                        <Label>Question générale</Label>
                        <TextInput
                            isTextArea
                            fullWidth
                            placeholder="Question générale de la thématique d'évaluation..."
                            currentValue={question}
                            onChange={q => setQuestion(q)}
                        />
                    </FieldContainer>
                    <FieldContainer fullWidth>
                        <Label>Pondérateur de la question générale</Label>
                        <NumericField
                            fullWidth
                            min={1}
                            value={questionPonderateur}
                            onChange={p => setQuestionPonderateur(p)}
                        />
                    </FieldContainer>
                    <div className="w-full flex flex-col gap-4">
                        <div className="flex flex-row justify-between items-center w-full gap-8">
                            <Label>Questions spécifiques</Label>
                            <Button
                                icon={faPlus}
                                role="secondary"
                                onClick={() => setQuestionModalIsOpen(true)}>
                                Ajouter une question
                            </Button>
                        </div>
                        <div className="w-full h-[1px] bg-primary/10"></div>
                        {
                            questions.length > 0 ?
                            <ul className="flex flex-col gap-4">
                            {
                                questions.map((question, index) => (
                                    <>
                                        <li 
                                            className="w-full flex flex-row items-center gap-4"
                                            key={`question-${index}-${question.question}`}>
                                            <div className="flex flex-col gap-2 flex-1">
                                                <div className="flex flex-row flex-wrap gap-2">
                                                    {
                                                        question.titre ?
                                                        <p className="text-md font-normal text-primary/60">{question.titre}</p>
                                                        : <></>
                                                    }
                                                    {
                                                        question.optional ?
                                                        <span className="text-sm font-semibold text-primary/60">(Optionnelle)</span>
                                                        : <></>
                                                    }
                                                </div>
                                                <p className="text-md font-normal text-primary">{question.question}</p>
                                            </div>
                                            <Button 
                                                hasBorders
                                                icon={faEdit}
                                                role="tertiary"
                                                onClick={() => {
                                                    setSelectedQuestionId(index)
                                                    setQuestionEditModalIsOpen(true)
                                                }}
                                            > </Button>
                                            <Button 
                                                hasBorders
                                                icon={faTrash}
                                                role="tertiary"
                                                status="danger"
                                                onClick={() => setQuestions(questions.filter((_, i) => i !== index))}
                                            > </Button>
                                        </li>
                                        <div className="w-full h-[1px] bg-primary/10"></div>
                                    </>
                                ))
                            }
                            </ul>
                            :
                            <p className="text-sm text-primary/60">Aucune question spécifique</p>
                        }
                    </div>
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
            <QuestionFormModal
                isOpen={questionModalIsOpen}
                onClose={() => setQuestionModalIsOpen(false)}
                onSubmit={q => setQuestions([...questions, q])}
            />
            <QuestionFormModal
                question={questions[selectedQuestionId]}
                isOpen={questionEditModalIsOpen}
                onClose={() => setQuestionEditModalIsOpen(false)}
                onSubmit={q => {
                    const newQuestions = [...questions]
                    newQuestions[selectedQuestionId] = q
                    setQuestions(newQuestions)
                }}
            />
        </>
    
    )

}

export default ThematiqueFormModal