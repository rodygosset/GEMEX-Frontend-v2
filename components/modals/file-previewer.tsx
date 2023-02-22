import ModalContainer from "./modal-container";


interface Props {
    isVisible: boolean;
    closeModal: () => void;
}

const FilePreviewer = (
    {
        isVisible,
        closeModal
    }: Props
) => {

    // render

    const modalProps = { isVisible, closeModal }

    return (
        <ModalContainer {...modalProps}>
            hello
        </ModalContainer>
    )
}

export default FilePreviewer