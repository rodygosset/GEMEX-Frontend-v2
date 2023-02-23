import { Portal } from "react-portal";
import styles from "@styles/components/modals/modal-container.module.scss"


interface Props {
    children: any;
    isVisible: boolean;
}

const ModalContainer = (
    {
        children,
        isVisible
    }: Props
) => {

    // render

    return (
        <>
        {
            isVisible ?
            <Portal>
                <div className={styles.container}>
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