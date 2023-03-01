import { Fichier } from "@conf/api/data-types/fichier";
import useAPIRequest from "@hook/useAPIRequest";
import styles from "@styles/components/form-elements/file-input.module.scss"
import { ChangeEvent, useEffect, useRef, useState } from "react";
import FileCard from "@components/cards/file-card";
import Button from "@components/button";
import { faCloud, faLaptop } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import GenericModalDialog from "@components/modals/generic-modal-dialog";
import FilePicker from "@components/modals/file-picker";

interface Props {
    value: string[];
    onChange: (newValue: string[]) => void;
}

const FileInput = (
    {
        value,
        onChange
    }: Props
) => {

    // state

    const [fichiers, setFichiers] = useState<Fichier[]>([])

    // value being a list of file names we want to render in cards
    // we need to get info on each file from the API
    // by making an API request

    const makeAPIRequest = useAPIRequest()

    const getFiles = () => {
        setFichiers([])
        for(const fileName of value) {
            makeAPIRequest<Fichier[], void>(
                "post",
                "fichiers",
                "search/",
                {
                    nom: fileName
                },
                res => setFichiers((currentList) => [...currentList, ...res.data])
            )
        }
    }

    // keep fichiers up to date with value

    useEffect(() => getFiles(), [value])

    // manage local file upload

    const [localFile, setLocalFile] = useState<File | undefined>()

    // open the dialog when the user clicks on the upload button

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUploadClick = () => {
        if(!fileInputRef.current) return
        fileInputRef.current.click()
    }

    // the native HTML file input handles letting the user choose a file
    // so we only have to get back the chosen file's info

    const handleLocalFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if(!e.target.files) return
        setLocalFile(e.target.files[0])
    }

    // upload confirmation dialog

    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)

    // if the file isn't empty,
    // show the confirmation dialog

    useEffect(() => {
        setShowConfirmationDialog(localFile ? true : false)
    }, [localFile])
    
    // upload the file selected by the user

    const uploadLocalFile = () => {
        if(!localFile) return
        // we need to create a form data object
        // so we can upload the file over HTTP to our API
        const formData = new FormData()
        formData.append('new_fichier', localFile)

        // upload

        makeAPIRequest<Fichier, void>(
            "post", 
            "fichiers", 
            undefined, 
            formData, 
            // when the file is done uploading, 
            // add it to the list of selected files
            res => {
                onChange([...value, res.data.nom])
                setLocalFile(undefined)
            }
        )
    }


    // manage GEMEX file picker modal

    const [showFilePicker, setShowFilePicker] = useState(false)

    const handleFileSelect = (fileName: string) => {
        // don't include the same file more than once in the list
        if(value.includes(fileName)) return
        onChange([...value, fileName])
    }

    // make sure there are files that have been selected
    // & that we have gotten the info we need
    // before rendering the list of files in to cards

    const fileListIsEmpty = () => !value || fichiers.length == 0 || fichiers.length != value.length
    
    // allow the user to de-select files

    const handleDeSelect = (fileName: string) => onChange(value.filter(f => f != fileName))


    // render

    return (
        <>
            <div className={styles.container}>
                <h4>Fichiers</h4>
                <div className={styles.fileListContainer}>
                {
                    !fileListIsEmpty() ?
                    // if files have been selected
                    <ul className={styles.fileList}>
                    {
                        fichiers.map(file => { 
                            return (
                                <FileCard 
                                    key={file.nom + "_file_input"} 
                                    file={file}
                                    multiSelectionMode
                                    onDeSelect={() => handleDeSelect(file.nom)}
                                />
                            )
                        })
                    }
                    </ul>
                    :
                    <></>
                }
                    <div className={styles.noFilesContainer}>
                    {
                        
                        // in case there's no files yet
                        fileListIsEmpty() ?
                        <div className={styles.illustrationContainer}>
                            <Image 
                                quality={100}
                                src={'/images/void.svg'} 
                                alt={"Aucun fichier"} 
                                priority
                                fill
                                style={{ 
                                    objectFit: "contain", 
                                    top: "auto"
                                }}
                            />
                        </div>
                        :
                        <></>
                    } 
                        <div className={styles.textContent}>
                            {
                                // in case there's no files yet
                                fileListIsEmpty() ?
                                <p>Aucun fichier sélectionné</p>
                                :
                                <></>
                            }
                            <Button
                                icon={faLaptop}
                                role="tertiary"
                                onClick={handleUploadClick}>
                                <input 
                                    type="file" 
                                    id="file" 
                                    hidden 
                                    ref={fileInputRef}
                                    onClick={e => e.stopPropagation()}
                                    onChange={handleLocalFileChange} 
                                />
                                <span>Ajouter un fichier local</span>
                            </Button>
                            <Button
                                icon={faCloud}
                                role="tertiary"
                                onClick={() => setShowFilePicker(true)}>
                                Choisir un fichier dans GEMEX
                            </Button>
                        </div>
                        
                    </div>
                </div>
            </div>
            <GenericModalDialog
                isVisible={showConfirmationDialog}
                title="Ajouter un fichier local"
                question="Sauvegarder ce fichier dans GEMEX ?"
                yesOption='Sauvegarder'
                noOption='Annuler'
                onYesClick={uploadLocalFile}
                onNoClick={() => setLocalFile(undefined)}
                closeModal={() => setShowConfirmationDialog(false)}
            />
            <FilePicker
                isVisible={showFilePicker}
                onSelect={handleFileSelect}
                closeModal={() => setShowFilePicker(false)}
            />
        </>
        
    )
}


export default FileInput