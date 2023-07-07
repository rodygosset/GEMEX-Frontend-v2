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
import { useSession } from "next-auth/react";
import { MySession } from "@conf/utility-types";


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

    const { data, status } = useSession()

    const session = (data as MySession | null)

    // state

    const [nom, setNom] = useState(expoGroup?.nom || "")
    const [selectedExpositions, setSelectedExpositions] = useState(expoGroup?.expositions || [])
    
    // manage select options

    const [expositions, setExpositions] = useState<SelectOption<number>[]>([])

    // fetch expositions for the select

    useEffect(() => {

        if (!session) return

        makeAPIRequest<Exposition[], void>(
            session,
            "get",
            "expositions",
            undefined,
            undefined,
            res => setExpositions(res.data.map(expo => ({
                value: expo.id,
                label: expo.nom
            })))
        )

    }, [session])

    // handlers

    const handleSelectChange = (selectedOptions: string[]) => {
        setSelectedExpositions(selectedOptions.map(option => {
            const exposition = expositions.find(expo => expo.label === option)
            return exposition ? {
                id: exposition.value,
                nom: exposition.label
            } : { id: 0, nom: "" }
        }))
    }

    // when the form is submitted, call the onSubmit prop with the form data
    // & clear the form + close it

    const handleSubmit = () => {
        onSubmit({
            nom,
            expositions: selectedExpositions
        })
        setNom("")
        setSelectedExpositions([])
        onClose()
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
                    placeholder="Permanent, Temporaire, etc."
                    currentValue={nom}   
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
                    value={selectedExpositions.map(expo => expo.nom)}
                    onChange={handleSelectChange}
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
                    onClick={handleSubmit}
                    fullWidth
                >
                {
                    expoGroup ? "Modifier" : "Ajouter"
                }
                </Button>
            </div>

        </form>
    )
}

export default ExpoGroupForm