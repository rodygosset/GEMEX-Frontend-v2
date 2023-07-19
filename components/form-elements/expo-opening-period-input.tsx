
import Button from "@components/button";
import { faEdit, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import styles from "@styles/components/form-elements/expo-opening-period-input.module.scss"
import { useEffect, useState } from "react";
import { Popover } from "react-tiny-popover";
import DateRangeInput from "./date-range-input";
import { APIDateRange } from "@utils/types";



interface FormProps {
    name: string;
    value?: APIDateRange;
    onSubmit: (value: APIDateRange) => void;
}

const OpeningPeriodForm = (
    {
        name,
        value,
        onSubmit
    }: FormProps
) => {

    // state

    const [dateRange, setDateRange] = useState(value)

    // effects

    useEffect(() => {
        setDateRange(value)
    }, [value])

    // handlers

    const handleSubmit = () => {
        if(!dateRange) return
        onSubmit(dateRange)
        if(!value) setDateRange(undefined)
    }

    // utils

    const isSubmitActive = () => {
        if(!value) return dateRange !== undefined
        return dateRange !== undefined && (
            dateRange.date_debut !== value.date_debut ||
            dateRange.date_fin !== value.date_fin
        )
    }


    // render

    return (
        <div className={styles.form}>
            <h3>{value ? "Modifier" : "Ajouter"} une période d'ouverture</h3>
            <DateRangeInput 
                name={name}
                value={dateRange}
                onChange={setDateRange}
            />
            <div className={styles.buttonsContainer}>
                {
                    value ?
                    <Button
                        role="secondary"
                        fullWidth
                        onClick={() => onSubmit(value)}>
                        Annuler
                    </Button>
                    :
                    <Button
                        role="secondary"
                        fullWidth
                        onClick={() => setDateRange(undefined)}
                        active={dateRange !== undefined}>
                        Reset
                    </Button>
                }
                <Button
                    fullWidth
                    onClick={handleSubmit}
                    active={isSubmitActive()}>
                {
                    value ? "Modifier" : "Ajouter"
                }
                </Button>
            </div>
        </div>
    )
}

interface Props {
    name: string;
    value: APIDateRange[];
    onChange: (value: APIDateRange[]) => void;
}


const ExpoOpeningPeriodInput = (
    {
        name,
        value,
        onChange
    }: Props
) => {

    // state

    const [showPopover, setShowPopover] = useState<boolean>(false)
    const [listItemsPopovers, setListItemsPopovers] = useState<boolean[]>(new Array(value.length).fill(false))

    // effects

    // keep track of the number of items in the list, and update the list of popovers accordingly

    useEffect(() => {

        if (value.length == listItemsPopovers.length) return

        setListItemsPopovers(new Array(value.length).fill(false))

    }, [value.length])

    // render

    return (
        <div className={styles.container}>
            {
                value.length > 0 ?
                <ul>
                {
                    value.map((period, i) => (
                        <li key={`period-${i}`}>
                        {
                            period.date_fin ?
                            <p>Du <span>{new Date(period.date_debut).toLocaleDateString("fr")}</span> au <span>{new Date(period.date_fin).toLocaleDateString("fr")}</span></p>
                            :
                            <p>À partir du <span>{new Date(period.date_debut).toLocaleDateString("fr")}</span></p>
                        }
                            <Popover
                                containerClassName={"react-tiny-popover-container " + styles.popoverContainer}
                                isOpen={listItemsPopovers[i]}
                                padding={10}
                                content={() => (
                                    <OpeningPeriodForm
                                        name={name}
                                        value={period}
                                        onSubmit={newVal => {
                                            onChange(value.map((p, j) => i === j ? newVal : p))
                                            setListItemsPopovers(listItemsPopovers.map((p, j) => i === j ? !p : p))
                                        }}
                                    />
                                )}>
                                    <Button
                                        icon={faEdit}
                                        role="tertiary"
                                        onClick={() => setListItemsPopovers(listItemsPopovers.map((p, j) => i === j ? !p : p))}>
                                    </Button>
                            </Popover>
                            <Button
                                icon={faTrash}
                                role="tertiary"
                                status="danger"
                                onClick={() => onChange(value.filter((p, j) => i !== j))}>
                            </Button>
                        </li>
                    ))
                }
                </ul>
                : 
                <p className={styles.noData}>Aucune période d'ouverture</p>
            }
            <div className={styles.buttonsContainer}>
                <Popover
                    containerClassName={"react-tiny-popover-container " + styles.popoverContainer}
                    isOpen={showPopover}
                    padding={10}
                    content={() => (
                        <OpeningPeriodForm
                            name={name}
                            onSubmit={newVal => {
                                onChange([...value, newVal])
                                setShowPopover(false)
                            }}
                        />
                    )}>
                        <Button
                            icon={faPlus}
                            onClick={() => setShowPopover(!showPopover)}>
                            Ajouter une période
                        </Button>
                </Popover>
            </div>
        </div>
    )
}

export default ExpoOpeningPeriodInput