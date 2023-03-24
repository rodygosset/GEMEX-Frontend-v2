import Button from "@components/button";
import FileCard from "@components/cards/file-card";
import SearchBar from "@components/form-elements/search-bar";
import LoadingIndicator from "@components/utils/loading-indicator";
import VerticalScrollBar from "@components/utils/vertical-scrollbar";
import { Fichier } from "@conf/api/data-types/fichier";
import { faList, faTableCellsLarge, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import styles from "@styles/components/modals/file-picker.module.scss"
import { useEffect, useState } from "react";
import ModalContainer from "./modal-container";
import Image from "next/image";
import useAPIRequest from "@hook/useAPIRequest";
import { useSession } from "next-auth/react";
import { MySession } from "@conf/utility-types";
import { DynamicObject } from "@utils/types";
import DeleteDialog from "./delete-dialog";

interface Props {
    isVisible: boolean;
    isExplorer?: boolean;
    onSelect?: (fileName: string) => void;
    closeModal: () => void;
}

const FilePicker = (
    {
        isVisible,
        isExplorer,
        onSelect,
        closeModal
    }: Props
) => {

    const session = useSession()
    
    const user = (session.data as MySession | null)?.user


    // state

    const [selectedFiles, setSelectedFiles] = useState<string[]>([""])

    const isSelected = (fileName: string) => {
        return isExplorer ? selectedFiles.includes(fileName) : selectedFiles[0] == fileName
    }

    // search & results state variables

    const [searchQ, setSearchQ] = useState("")

    const [files, setFiles] = useState<Fichier[]>([])

    const [isLoading, setIsLoading] = useState(false)


    // manage view mode (list or card)

    const [isListView, setIsListView] = useState(false)

    // manage file category (my files or all files)

    const [isAllCategory, setIsAllCategory] = useState(false)

    
    // get the file from our API

    const makeAPIRequest = useAPIRequest()

    useEffect(() => {

        // clear selection

        setSelectedFiles([""])

        const getSearchParams = () => {
            let searchParams: DynamicObject = {}
            if(searchQ) searchParams.nom = searchQ
            if(!isAllCategory && user) searchParams.user_id = user.id
            return searchParams

        }

        // make the request

        makeAPIRequest<Fichier[], void>(
            "post",
            "fichiers",
            "search/",
            getSearchParams(),
            res => setFiles([...res.data])
        )
        


    }, [searchQ, isAllCategory])

    // handlers

    const handleSearchInputChange = (newQ: string) => setSearchQ(newQ)

    const handleSelect = () => {
        if(onSelect) onSelect(selectedFiles[0])
        setSelectedFiles([""])
        closeModal()
    }

    // handle file deletion in explorer

    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const handleDeleteClick = () => setShowDeleteDialog(true)

    // utils

    const getFileListClassNames = () => {
        let classNames = styles.fileList
        classNames += isListView ? ' ' + styles.listView : ''
        return classNames
    }

    // compute which view mode button should show as the current selected view mode
    // & return the corresponding CSS class

    const getViewModeButtonClassName = (isListViewButton: boolean) => {
        if(isListViewButton && isListView || !isListViewButton && !isListView) {
            return styles.selected
        }
        return ''
    }

    // compute which button should show as the current selected category
    // & return the corresponding CSS class

    const getFileCategoryButtonClassName = (isAllCategoryButton: boolean) => {
        if(isAllCategoryButton && isAllCategory || !isAllCategoryButton && !isAllCategory) {
            return styles.selected
        }
        return ''
    }

    const toggleSelection = (fileName: string) => {
        if(isExplorer) {
            // allow multiple selection
            // de-select the file if it's already selected
            if(selectedFiles.includes(fileName)) {
                setSelectedFiles(selectedFiles.filter(f => f != fileName))
            } else {
                // add it to the list otherwise
                setSelectedFiles([...selectedFiles, fileName])
            }
            return
        }
        // same here, but single selection
        if(fileName == selectedFiles[0]) setSelectedFiles([""])
        else setSelectedFiles([fileName])
    }

    // render

    return (
        <ModalContainer isVisible={isVisible}>
            <section className={styles.modal}>
                {
                    isExplorer ?
                    <h4>Explorer les fichiers</h4>
                    :
                    <h4>Sélectionner un fichier</h4>
                }
                <SearchBar
                    fullWidth
                    hideCTA
                    hideSelect
                    onInputChange={handleSearchInputChange}
                />
                <div className={styles.buttonsContainer}>
                    <div className={styles.buttonGroup}>
                        <Button
                            className={getFileCategoryButtonClassName(false)}
                            role="tertiary"
                            bigPadding
                            onClick={() => setIsAllCategory(false)}>
                            Mes Fichiers
                        </Button>
                        <Button
                            className={getFileCategoryButtonClassName(true)}
                            role="tertiary"
                            bigPadding
                            onClick={() => setIsAllCategory(true)}>
                            Tous les fichiers
                        </Button>
                        {
                            isExplorer && selectedFiles.length > 1 && !isAllCategory ?
                            <Button
                                icon={faTrashAlt}
                                className={getFileCategoryButtonClassName(true)}
                                role="secondary"
                                status="danger"
                                bigPadding
                                onClick={handleDeleteClick}>
                                Supprimer ({ selectedFiles.length - 1 })
                            </Button>
                            :
                            <></>
                        }
                    </div>
                    <div className={styles.buttonGroup}>
                        <Button
                            className={getViewModeButtonClassName(false)}
                            icon={faTableCellsLarge}
                            role="tertiary"
                            bigPadding
                            onClick={() => setIsListView(false)}>
                            Cartes
                        </Button>
                        <Button
                            className={getViewModeButtonClassName(true)}
                            icon={faList}
                            role="tertiary"
                            bigPadding
                            onClick={() => setIsListView(true)}>
                            Liste
                        </Button>
                    </div>
                </div>
                {
                    // don't display any content
                    // if there aren't no search results
                    files.length > 0 && !isLoading ?
                    <VerticalScrollBar className={styles.scrollContainer}>
                        <ul className={getFileListClassNames()}>
                        {
                            files.map(file => { 
                                return (
                                    <FileCard 
                                        key={file.nom + "_file_picker"} 
                                        file={file}
                                        isSearchResult
                                        isListItem={isListView}
                                        isSelected={isSelected(file.nom)}
                                        onClick={() => toggleSelection(file.nom)}
                                    />
                                )
                            })
                        }
                        </ul>
                    </VerticalScrollBar>
                    :
                    // while loading
                    // display a loading indicator
                    isLoading ?
                    <div className={styles.loadingIndicatorContainer}>
                        <LoadingIndicator/>
                        <h4>Chargement...</h4>
                    </div>
                    :
                    // if there aren't any results
                    // display the corresponding illustration
                    // & a message for the user
                    <div className={styles.noResultsMessageContainer}>
                        <div className={styles.illustrationContainer}>
                            <Image 
                                quality={100}
                                src={'/images/no-results-illustration.svg'} 
                                alt={"Aucun résultat."} 
                                priority
                                fill
                                style={{ 
                                    objectFit: "contain", 
                                    top: "auto"
                                }}
                            />
                        </div>
                        <h1>Aucun résultat...</h1>
                        <p>Ré-essayer en changeant les paramètres de recherche</p>
                    </div>
                }
                {
                    isExplorer ?
                    <Button
                        role="secondary"
                        animateOnHover={false}
                        onClick={closeModal}>
                        Fermer
                    </Button>
                    :
                    <div className={styles.CTAContainer}>
                        <Button
                            role="secondary"
                            animateOnHover={false}
                            onClick={closeModal}>
                            Annuler
                        </Button>
                        <Button
                            active={selectedFiles[0] != ""}
                            onClick={handleSelect}>
                            Sélectionner
                        </Button>
                    </div>
                }
            </section>
            <DeleteDialog 
                isVisible={showDeleteDialog}
                closeDialog={() => setShowDeleteDialog(false)}
                itemType={"fichiers"}
                itemTitle={selectedFiles.length - 1 > 1 ? `${selectedFiles.length - 1} fichiers` : selectedFiles[1]}
                isMulti
                itemIDList={selectedFiles.slice(1)}
            />
        </ModalContainer>
    )
}

export default FilePicker