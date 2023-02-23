import Button from "@components/button";
import { apiURL, apiURLs } from "@conf/api/conf";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "@styles/components/modals/file-previewer.module.scss"
import { FileInfo } from "@utils/fichiers";
import ModalContainer from "./modal-container";
import Image from "next/image";
import { useRef } from "react";
import dynamic from "next/dynamic";

const MyPDFViewer = dynamic(() => import("./my-pdf-viewer"), { ssr: false });


interface Props {
    isVisible: boolean;
    closeModal: () => void;
    fileName: string;
    fileInfo: FileInfo;
    ownerFullName: string;
}

const FilePreviewer = (
    {
        isVisible,
        closeModal,
        fileName,
        fileInfo,
        ownerFullName
    }: Props
) => {



    // the following function computes how to render the file's content

    const renderFilePreview = () => {
        const extension = fileInfo.extension
        switch(extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return (
                    <div className={styles.imageContainer}>
                        <Image
                            src={getFileURL()}
                            alt={fileInfo.fileName}
                            fill
                            style={{ 
                                objectFit: "contain"
                            }}
                            className={styles.image}
                        />
                    </div>
                )
            case 'pdf':
                return <MyPDFViewer URL={getFileURL()} />
            default:
                return (
                    <p className={styles.unsupportedFileTypeMessage}>
                        Pas d&apos;aperçue disponible pour ce type de fichier.
                    </p>
                )
        }
    }


    // utils

    const getFileURL = () => `${apiURL}${apiURLs["fichiers"]}${fileName}`

    // handle download button click

    // as I wanted to use the Button component's styles
    // instead of having to style the anchor element like a button
    // we use a ref to trigger the download when the user clicks outside of the anchor
    // but inside of the button

    const downloadLinkRef = useRef<HTMLAnchorElement>(null)

    const handleDownload = () => {
        if(!downloadLinkRef.current) return
        downloadLinkRef.current.click()
    }

    // render

    return (
        <ModalContainer isVisible={isVisible}>
            <section className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.fileInfo}>
                        <div className={styles.fileName}>
                            <FontAwesomeIcon icon={fileInfo.icon}/>
                            <h3>
                                {fileInfo.fileName}
                                {
                                    // don't display the count if it ain't at least one
                                    fileInfo.count > 0 ?
                                    ` (${fileInfo.count})`
                                    : 
                                    ""
                                }
                            </h3>
                        </div>
                        <p>{ownerFullName}</p>
                    </div>
                    <Button
                        icon={faDownload}
                        onClick={handleDownload}>
                        <a 
                            onClick={e => e.stopPropagation()}
                            href={getFileURL()} 
                            download={fileName} 
                            ref={downloadLinkRef}>
                            Télécharger
                        </a>
                    </Button>
                </div>
                {
                    renderFilePreview()
                }
                <Button
                    role="secondary"
                    onClick={closeModal}>
                    Fermer
                </Button>
            </section>
        </ModalContainer>
    )
}

export default FilePreviewer