import { faBackward, faCaretLeft, faCaretRight, faForward } from "@fortawesome/free-solid-svg-icons"
import styles from "@styles/components/pagination.module.scss"
import Button from "./button";


interface Props {
    currentPageNb: number;
    totalPagesNb: number;
    setPageNb: (newPageNb: number) => void;
}

const Pagination = (
    {
        currentPageNb,
        totalPagesNb,
        setPageNb
    }: Props
) => {

    const isInBounds = (pageNb: number) => pageNb >= 1 && pageNb <= totalPagesNb

    const handlePageChange = (newPageNb: number) => {
        if(!isInBounds(newPageNb)) return
        setPageNb(newPageNb)
    }

    const handleClickPrev = () => handlePageChange(currentPageNb - 1)

    const handleClickNext = () => handlePageChange(currentPageNb + 1)

    const handleClickBackward = () => handlePageChange(1)

    const handleClickForward = () => handlePageChange(totalPagesNb)

    // render

    return (
        <div className={styles.container}>
            <Button
                className={styles.edgeButton}
                icon={faBackward} 
                role="tertiary"
                bigPadding
                animateOnHover={false}
                onClick={handleClickBackward}>
            </Button>
            <Button
                icon={faCaretLeft}
                role="secondary"
                bigPadding
                onClick={handleClickPrev}>
            </Button>
            <p>Page {currentPageNb} / {totalPagesNb}</p>
            <Button
                icon={faCaretRight}
                role="secondary"
                bigPadding
                onClick={handleClickNext}>
            </Button>
            <Button
                className={styles.edgeButton}
                icon={faForward} 
                role="tertiary"
                bigPadding
                animateOnHover={false}
                onClick={handleClickForward}>
            </Button>
        </div>
    )
}

export default Pagination