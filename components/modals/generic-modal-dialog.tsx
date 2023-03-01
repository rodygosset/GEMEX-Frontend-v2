import Button from "@components/button";
import ModalContainer from "./modal-container"
import styles from "@styles/components/modals/generic-modal-dialog.module.scss"


interface Props {
    isVisible: boolean;
    title: string;
    question: string;
    yesOption: string;
    noOption: string;
    onYesClick: () => void;
    onNoClick?: () => void;
    closeModal: () => void;
}

const GenericModalDialog = (
    {
        isVisible,
        title,
        question,
        yesOption,
        noOption,
        onYesClick,
        onNoClick,
        closeModal
    }: Props
) => {


    const handleNoClick = () => {
        if(onNoClick) onNoClick()
        closeModal()
    }

    // render

    return (
        <ModalContainer isVisible={isVisible}>
            <section className={styles.modal}>
                <h4>{title}</h4>
                <p>{question}</p>
                <div className={styles.buttonsContainer}>
                    <Button
                        onClick={handleNoClick}
                        role="secondary"
                        animateOnHover={false}
                        fullWidth>
                        {noOption}
                    </Button>
                    <Button
                        onClick={onYesClick}
                        role="primary"
                        fullWidth>
                        {yesOption}
                    </Button>
                </div>
            </section>
        </ModalContainer>
    )
}

export default GenericModalDialog