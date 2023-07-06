import FieldContainer from "@components/form-elements/field-container";
import Label from "@components/form-elements/label";
import Select from "@components/form-elements/select";
import TextInput from "@components/form-elements/text-input";
import { Exposition } from "@conf/api/data-types/exposition";
import useAPIRequest from "@hook/useAPIRequest";
import { SelectOption } from "@utils/react-select/types";
import { ExpoGroupCreate } from "@utils/types"
import { useEffect, useState } from "react";

import styles from "@styles/components/forms/expo-group-form.module.scss"
import Button from "@components/button";


interface Props {
    expoGroup?: ExpoGroupCreate;
    onSubmit: (expoGroup: ExpoGroupCreate) => void;
    onClose: () => void;
}

const ExpoGroupForm = (
    {
        expoGroup,
        onSubmit,
        onClose
    }: Props
) => {

    const makeAPIRequest = useAPIRequest()

    // state

    const [nom, setNom] = useState(expoGroup?.nom || "")
    const [selectedExpositions, setSelectedExpositions] = useState(expoGroup?.expositions || [])
    
    // manage select options

    const [expositions, setExpositions] = useState<SelectOption[]>([])

    useEffect(() => {

        makeAPIRequest<Exposition[], void>(
            "get",
            "expositions",
            undefined,
            undefined,
            res => setExpositions(res.data.map(expo => ({
                value: expo.id,
                label: expo.nom
            })))
        )

    }, [])


    // handlers


    // utils

    const getNomsExpositions = async (expos: { exposition_id: number }[]) => {
        // for each expo, make a request to the API to get the name

        return await Promise.all(expos.map(async expo => {
            let response
            try {
                response = await makeAPIRequest<Exposition, Exposition>(
                    "get",
                    "expositions",
                    `id/${expo.exposition_id}`,
                    undefined,
                    res => res.data
                )
            } catch (error) {
                console.error(error)
                return ""
            }
            // if the request was successful, return the name
            // @ts-ignore
            return response?.nom || ""
        }))
    }



    // render

    return (
        <form 
            className={styles.form}
            onSubmit={e => e.preventDefault()}>
            <FieldContainer fullWidth>
                <Label>Nom du groupe</Label>
                <TextInput
                    name="nom"
                    defaultValue={nom}
                    onChange={setNom}
                    fullWidth
                />
            </FieldContainer>
            <FieldContainer fullWidth>
                <Label>Expositions</Label>
                <Select
                    name="expositions"
                    isMulti
                    options={expositions}
                    onChange={setSelectedExpositions}
                    fullWidth
                />
            </FieldContainer>
            <div className={styles.buttonsContainer}>
                <Button
                    onClick={onClose}
                    role="secondary"
                    fullWidth
                >
                    Annuler
                </Button>
                <Button
                    onClick={() => onSubmit({
                        nom,
                        expositions: selectedExpositions
                    })}
                    fullWidth
                >
                    Ajouter
                </Button>
            </div>

        </form>
    )
}

export default ExpoGroupForm