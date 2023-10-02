import { QuestionCreate } from "@conf/api/data-types/quality-module";
import ModalContainer from "../modal-container";
import { useEffect, useState } from "react";
import Button from "@components/button";
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";
import FieldContainer from "@components/form-elements/field-container";
import Label from "@components/form-elements/label";
import TextInput from "@components/form-elements/text-input";
import CheckBox from "@components/form-elements/checkbox";


interface Props {
    question?: QuestionCreate;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (q: QuestionCreate) => void;
}

const QuestionFormModal = (
    {
        question,
        isOpen,
        onClose,
        onSubmit
    }: Props
) => {


    // form state

    const [titre, setTitre] = useState<string | undefined>("")
    const [q, setQ] = useState<string>("")
    const [optional, setOptional] = useState<boolean>(false)


    useEffect(() => {
        if(!question) return

        setTitre(question.titre)
        setQ(question.question)
        setOptional(question.optional)
    }, [question, isOpen])

    // utils

    const clearFormFields = () => {
        setTitre("")
        setQ("")
        setOptional(false)
    }

    const getUniqueId = () => {
        // generate random id & return it
        return Math.floor(Math.random() * 1000)
    }

    // handlers

    const handleClose = () => {
        clearFormFields()
        onClose()
    }

    const handleSubmit = () => {
        onSubmit({
            id: question ? question.id : getUniqueId(),
            titre,
            question: q,
            optional
        })
        handleClose()
    }

    // render


    return (
        <ModalContainer isVisible={isOpen}>
            <form
                className="flex flex-col gap-8 min-w-[400px] overflow-auto bg-white rounded-2xl p-[32px]"
                name="question-form">

                <h3 className="text-xl font-bold text-blue-600 flex-1">
                    {
                        question ? "Modifier la question" : "Nouvelle question"
                    }
                </h3>
                <div className="w-full h-[1px] bg-blue-600/10"></div>
                <FieldContainer fullWidth>
                    <Label>Titre (optionnel)</Label>
                    <TextInput
                        fullWidth
                        placeholder="Qualité de l'exposition..."
                        currentValue={titre}
                        onChange={t => setTitre(t)}
                    />
                </FieldContainer>
                <FieldContainer fullWidth>
                    <Label>Question</Label>
                    <TextInput
                        isTextArea
                        fullWidth
                        placeholder="Comment trouvez-vous la qualité de l'exposition ?"
                        currentValue={q}
                        onChange={value => setQ(value)}
                    />
                </FieldContainer>
                <FieldContainer fullWidth>
                    <Label>La question est-elle optionnelle ?</Label>
                    <CheckBox
                        value={optional}
                        onChange={o => setOptional(o)}
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
                        active={q ? true : false}
                        fullWidth
                        icon={question ? faEdit : faPlus}
                        onClick={handleSubmit}>
                    {
                        question ? "Modifier" : "Ajouter"
                    }
                    </Button>
                </div>
            </form>
        </ModalContainer>
    )

}

export default QuestionFormModal