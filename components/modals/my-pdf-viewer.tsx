
import Button from '@components/button'
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


import styles from '@styles/components/modals/pdf-viewer.module.scss'
import NumericField from '@components/form-elements/numeric-field'


interface Props {
    URL: string;
}

const MyPDFViewer = (
    {
        URL
    }: Props
) => {

    const [nbPages, setNbPages] = useState<number>(0)
    const [pageNb, setPageNb] = useState<number>(0)

    const onDocumentLoadSuccess = (numPages: number) => {
        setNbPages(numPages)
        setPageNb(1)
    }

    const prevPage = () => {
        if(pageNb > 1) {
            setPageNb(pageNb - 1)
        }
    }

    const nextPage = () => {
        if(pageNb < nbPages) {
            setPageNb(pageNb + 1)
        }
    }

    const handlePageChange = (newValue: number) => setPageNb(newValue)

    return (
        <>
            <div className={styles.pdfViewer}>
                <Button
                    role="secondary"
                    bigPadding
                    icon={faAngleLeft}
                    onClick={prevPage}>
                </Button>
                <Document
                    file={URL}
                    onLoadSuccess={({ numPages }) => onDocumentLoadSuccess(numPages)}>
                    <Page 
                        pageNumber={pageNb} 
                        className={styles.pdfViewerPage}
                    />    
                </Document>
                <Button
                    role="secondary"
                    bigPadding
                    icon={faAngleRight}
                    onClick={nextPage}>
                </Button>
            </div>
            <div className={styles.pdfViewerInfo}>
                <span>Page</span> <NumericField value={pageNb} onChange={handlePageChange} min={1} max={nbPages} /> <span>/ {nbPages}</span>
            </div>
        </>
    )

}

export default MyPDFViewer