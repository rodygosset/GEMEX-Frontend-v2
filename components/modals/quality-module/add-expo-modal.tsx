import Button from "@components/button";
import ModalContainer from "../modal-container";
import { useState } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import FieldContainer from "@components/form-elements/field-container";
import Label from "@components/form-elements/label";
import ItemSelect from "@components/form-elements/item-select";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (expositionId: number) => void;
}

const AddExpoModal = (
    {
        isOpen,
        onClose,
        onSubmit
    }: Props
) => {

    const [selectedExpoId, setSelectedExpoId] = useState<number>(0)

    // handlers

    const handleSubmit = () => {
        onSubmit(selectedExpoId)
        setSelectedExpoId(0)
        onClose()
    }

    const handleClose = () => {
        onClose()
    }

    // render

    return (
        <ModalContainer isVisible={isOpen}>
            <form
                className="flex flex-col gap-8 w-[300px] overflow-auto bg-white rounded-2xl p-[32px]"
                name="add-expo-form">
                <div className="w-full flex flex-col">
                    <h3 className="text-xl font-bold text-blue-600 flex-1">Ajouter une exposition</h3>
                    <span className="text-base font-normal text-blue-600/60">A la liste pour ce cycle</span>
                </div>
                <div className="w-full h-[1px] bg-blue-600/10"></div>
                <FieldContainer fullWidth>
                    <Label>Exposition</Label>
                    <ItemSelect
                        name="exposition"
                        itemType="expositions"
                        fullWidth
                        selected={selectedExpoId}
                        onChange={setSelectedExpoId}
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
                        icon={faPlus}
                        active={selectedExpoId !== 0}
                        onClick={handleSubmit}>
                        Ajouter
                    </Button>
                </div>
            </form>
        </ModalContainer>
    )
}

export default AddExpoModal