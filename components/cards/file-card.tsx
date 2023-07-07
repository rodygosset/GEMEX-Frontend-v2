import styles from "@styles/components/cards/file-card.module.scss"
import { Fichier } from "@conf/api/data-types/fichier";
import { getUserFullName, User } from "@conf/api/data-types/user";
import { useEffect, useState } from "react";
import useAPIRequest from "@hook/useAPIRequest";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { destructFileName, FileInfo } from "@utils/fichiers";
import FilePreviewer from "@components/modals/file-previewer";
import Button from "@components/button";
import { faFolderOpen, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useSession } from "next-auth/react";
import { MySession } from "@conf/utility-types";

interface Props {
    file: Fichier;
    multiSelectionMode?: boolean;
    isSelected?: boolean;
    isSearchResult?: boolean;
    isListItem?: boolean;
    onDeSelect?: () => void;
    onClick?: () => void;
}

const FileCard = (
    {
        file,
        multiSelectionMode,
        isSelected,
        isSearchResult,
        isListItem,
        onDeSelect,
        onClick
    }: Props
) => {

    // retrieve info about the user who owns the file from our API

    const [fileOwner, setFileOwner] = useState<User>()

    const [fileInfo, setFileInfo] = useState<FileInfo>()

    // get session data

    const { data, status } = useSession()

    const session = (data as MySession | null)

    const makeAPIRequest = useAPIRequest()

    const getOwner = () => {
        if(!session) return
        makeAPIRequest<User, void>(
            session,
            "get",
            "users",
            `id/${file.user_id}`,
            undefined,
            res => setFileOwner(res.data)
        )
    }

    useEffect(() => getOwner(), [file, session])

    // once we've got the data we need
    // extract useful info from the file name

    useEffect(() => {
        if(!fileOwner) return
        setFileInfo(destructFileName(file.nom, fileOwner))
    }, [fileOwner])

    // file previewer logic

    const [isModalVisible, setIsModalVisible] = useState(false)

    const handleClick = () => {
        if(!onClick) setIsModalVisible(true)
        else onClick()
    }

    const getClassNames = () => {
        let classNames = styles.fileCard
        classNames += isSelected ? ' ' + styles.selected : ''
        classNames += isSearchResult ? ' ' + styles.searchResult : ''
        classNames += isListItem ? ' ' + styles.listItem : ''
        return classNames
    }

    // render

    return (
        // only render the card once we've extracted the info we want to display
        fileOwner && fileInfo ?
        <>
            <li className={getClassNames()} onClick={handleClick}>
                {
                    multiSelectionMode && onDeSelect ?
                    <Button
                        className={styles.xMark}
                        icon={faXmark}
                        role="tertiary"
                        hasPadding={false}
                        animateOnHover={false}
                        onClick={onDeSelect}>
                    </Button>
                    :
                    <></>
                }
                <FontAwesomeIcon icon={fileInfo.icon} className={styles.fileIcon} />
                <div>
                    <h5>
                        {fileInfo.fileName}
                        {
                            // don't display the count if it ain't at least one
                            fileInfo.count > 0 ?
                            ` (${fileInfo.count})`
                            : 
                            ""
                        }
                    </h5>
                    <p>{fileInfo.author}</p>
                </div>
                {
                    isSearchResult ?
                    <div className={styles.viewButtonContainer}>
                        <Button
                            className={styles.viewButton}
                            icon={faFolderOpen}
                            role="tertiary"
                            onClick={e => {
                                e.stopPropagation()
                                setIsModalVisible(true)
                            }}>
                        </Button>
                    </div>
                    :
                    <></>
                }
            </li>
            <FilePreviewer 
                isVisible={isModalVisible}
                closeModal={() => setIsModalVisible(false)}
                fileName={file.nom}
                fileInfo={fileInfo}
                ownerFullName={getUserFullName(fileOwner)}
            />
        </>
        :
        <></>
    )
}

export default FileCard