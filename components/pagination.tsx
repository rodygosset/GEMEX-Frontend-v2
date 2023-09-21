import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons"
import Button from "./button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "@utils/tailwind";


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

    // render

    return (
        <div className="flex items-center gap-[16px]">
            <span className="text-base text-primary/60 font-normal">
                Page {currentPageNb} sur {totalPagesNb}
            </span>
            <button
                className={cn(
                    "text-sm text-primary h-[40px] w-[40px] rounded-[8px] bg-primary/10 flex items-center justify-center",
                    "hover:bg-primary/20 transition-colors duration-300 ease-in-out",
                    !isInBounds(currentPageNb - 1) && "opacity-50 cursor-not-allowed"
                )}
                disabled={!isInBounds(currentPageNb - 1)}
                onClick={handleClickPrev}>
                <FontAwesomeIcon icon={faCaretLeft} />
            </button>
            <button
                className={cn(
                    "text-sm text-primary h-[40px] w-[40px] rounded-[8px] bg-primary/10 flex items-center justify-center",
                    "hover:bg-primary/20 transition-colors duration-300 ease-in-out",
                    !isInBounds(currentPageNb + 1) && "opacity-50 cursor-not-allowed"
                )}
                disabled={!isInBounds(currentPageNb + 1)}
                onClick={handleClickNext}>
                <FontAwesomeIcon icon={faCaretRight} />
            </button>
        </div>
    )
}

export default Pagination