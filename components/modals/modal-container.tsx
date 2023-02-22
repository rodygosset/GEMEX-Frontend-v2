import { Portal } from "react-portal";
import styles from "@styles/components/modals/modal-container.module.scss"


interface Props {
    children: any;
    isVisible: boolean;
    closeModal: () => void;
}

const ModalContainer = (
    {
        children,
        isVisible,
        closeModal
    }: Props
) => {

    // render

    return (
        <>
        {
            isVisible ?
            <Portal>
                <div className={styles.container} onClick={closeModal}>
                    { children }
                </div>
            </Portal>
            :
            <></>
        }
        </>
    )

}

export default ModalContainer