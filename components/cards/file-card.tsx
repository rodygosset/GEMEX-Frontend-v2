import styles from "@styles/components/cards/file-card.module.scss"
import { Fichier } from "@conf/api/data-types/fichier";
import { User } from "@conf/api/data-types/user";
import { useEffect, useState } from "react";
import useAPIRequest from "@hook/useAPIRequest";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { destructFileName, FileInfo } from "@utils/fichiers";
import FilePreviewer from "@components/modals/file-previewer";

interface Props {
    file: Fichier;
}

const FileCard = (
    {
        file
    }: Props
) => {

    // retrieve info about the user who owns the file from our API

    const [fileOwner, setFileOwner] = useState<User>()

    const [fileInfo, setFileInfo] = useState<FileInfo>()

    const makeAPIRequest = useAPIRequest()

    const getOwner = () => {
        makeAPIRequest<User, void>(
            "get",
            "users",
            `id/${file.user_id}`,
            undefined,
            res => setFileOwner(res.data)
        )
    }

    useEffect(() => getOwner(), [file])

    // once we've got the data we need
    // extract useful info from the file name

    useEffect(() => {
        if(!fileOwner) return
        setFileInfo(destructFileName(file.nom, fileOwner))
    }, [fileOwner])

    // file previewer logic

    const [isModalVisible, setIsModalVisible] = useState(false)

    const handleClick = () => setIsModalVisible(true)

    // render

    return (
        fileInfo ?
        <>
            <li className={styles.fileCard} onClick={handleClick}>
                <FontAwesomeIcon icon={fileInfo.icon}/>
                <div>
                    <h5>
                        {fileInfo.fileName}
                        {
                            fileInfo.count > 0 ?
                            ` (${fileInfo.count})`
                            : 
                            ""
                        }
                    </h5>
                    <p>{fileInfo.author}</p>
                </div>
            </li>
            <FilePreviewer 
                isVisible={isModalVisible}
                closeModal={() => setIsModalVisible(false)}
            />
        </>
        :
        <></>
    )
}

export default FileCard