
import styles from "@styles/components/cards/expo-group-card.module.scss"
import { Fragment, useState } from "react";
import ExpoGroupForm from "@components/forms/expo-group-form";
import Button from "@components/button";
import VerticalSeperator from "@components/utils/vertical-seperator";
import { ExpoGroupCreate } from "@conf/api/data-types/rapport";


interface Props {
    expoGroup: ExpoGroupCreate;
    selectMode?: boolean;
    isSelected?: boolean;
    onToggleSelect?: () => void;
    onChange?: (expoGroup: ExpoGroupCreate) => void;
    onDelete?: () => void;
}

const ExpoGroupCard = (
    {
        expoGroup,
        selectMode,
        isSelected,
        onToggleSelect,
        onChange,
        onDelete
    }: Props
) => {

    // state

    const [isEditing, setIsEditing] = useState(false)


    // utils

    const getClassNames = () => {
        let classNames = styles.container
        classNames += selectMode ? ` ${styles.selectMode}` : ""
        classNames += isSelected ? ` ${styles.selected}` : ""
        return classNames
    }

    // render

    return !isEditing || !onChange ? (
        <li className={getClassNames()} onClick={onToggleSelect}>
            <h4>{expoGroup.nom}</h4>
            <ul>
                {expoGroup.expositions.map((expo, index) => (
                    <Fragment key={expo.id}>
                        <li>{expo.nom}</li>
                        {
                            index < expoGroup.expositions.length - 1 ?
                            <hr className={styles.verticalSeparator} /> : <></>
                        }
                    </Fragment>
                    
                ))}
            </ul>

            <div className={styles.buttonsContainer}>
                {
                    !selectMode && onDelete && onChange ?
                    <>
                        <Button
                            role="tertiary"
                            className={styles.deleteButton}
                            status="danger"
                            fullWidth
                            onClick={onDelete}>
                            Supprimer
                        </Button>
                        <Button
                            role="secondary"
                            fullWidth
                            onClick={() => setIsEditing(true)}>
                            Modifier
                        </Button>
                    </>
                    : <></>
                }

            </div>
        </li>
    ) : (
        <li className={styles.formContainer}>
            <ExpoGroupForm 
                expoGroup={expoGroup}
                onSubmit={expoGroup => {
                    onChange(expoGroup)
                    setIsEditing(false)
                }}
                onClose={() => setIsEditing(false)}
            />
        </li>
    )
}

export default ExpoGroupCard