import { ExpoGroupCreate } from "@utils/types";

import styles from "@styles/components/cards/expo-group-card.module.scss"
import { useState } from "react";
import ExpoGroupForm from "@components/forms/expo-group-form";
import Button from "@components/button";
import VerticalSeperator from "@components/utils/vertical-seperator";


interface Props {
    expoGroup: ExpoGroupCreate
    onChange: (expoGroup: ExpoGroupCreate) => void
    onDelete: () => void
}

const ExpoGroupCard = (
    {
        expoGroup,
        onChange,
        onDelete
    }: Props
) => {

    // state

    const [isEditing, setIsEditing] = useState(false)


    // render

    return !isEditing ? (
        <li className={styles.container}>
            <h4>{expoGroup.nom}</h4>
            <ul>
                {expoGroup.expositions.map((expo, index) => (
                    <>
                        <li key={expo.id}>{expo.nom}</li>
                        {
                            index < expoGroup.expositions.length - 1 ?
                            <VerticalSeperator /> : <></>
                        }
                    </>
                    
                ))}
            </ul>

            <div className={styles.buttonsContainer}>
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