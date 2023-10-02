import { Cycle, MoisCycle } from "@conf/api/data-types/quality-module";
import ModalContainer from "../modal-container";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsSpin, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import Button from "@components/button";
import FieldContainer from "@components/form-elements/field-container";
import Label from "@components/form-elements/label";
import DateRangeInput from "@components/form-elements/date-range-input";
import { useState } from "react";
import { APIDateRange } from "@utils/types";
import { toISO } from "@utils/general";
import useAPIRequest from "@hook/useAPIRequest";
import { MySession } from "@conf/utility-types";
import { useSession } from "next-auth/react";


interface Props {
    cycle?: Cycle;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

const CycleFormModal = (
    {
        cycle,
        isOpen,
        onClose,
        onSubmit
    }: Props
) => {

    const [dateRange, setDateRange] = useState<APIDateRange>({
        // start at the beginning of the current year
        date_debut: toISO(new Date(new Date().getFullYear(), 0, 1)),
        // end at the end of the current year
        date_fin: toISO(new Date(new Date().getFullYear(), 11, 31))
    })


    // handlers

    const handleChange = (range: APIDateRange) => {
        // if the start date & end date are the same, set the end date to the end of the month
        if(range.date_debut === range.date_fin) {
            const endDate = new Date(range.date_debut)
            endDate.setMonth(endDate.getMonth() + 1)
            endDate.setDate(0)
            range.date_fin = toISO(endDate)
        }
        // update the state
        setDateRange(range)
    }

    const handleClose = () => {
        setDateRange({
            date_debut: toISO(new Date(new Date().getFullYear(), 0, 1)),
            date_fin: toISO(new Date(new Date().getFullYear(), 11, 31))
        })
        onClose()
    }

    // POST the data to the API

    const makeAPIRequest = useAPIRequest()
    const session = useSession().data as MySession | null

    const handleSubmit = () => {
        if(!session) return

        const data = {
            ...dateRange,
            expositions: []
        }

        makeAPIRequest<Cycle, void>(
            session,
            "post",
            "cycles",
            undefined,
            data,
            res => {
                const cycle = res.data
                // create the first monthly assessment for the cycle
                makeAPIRequest<MoisCycle, void>(
                    session,
                    "post",
                    "cycles",
                    `id/${cycle.id}/mois/next`,
                    undefined,
                    () => {
                        onSubmit()
                        handleClose()
                    }
                )
            }
        )
    }

    // render

    return (
        <ModalContainer isVisible={isOpen}>
            <form
                className="flex flex-col gap-8 w-[300px] overflow-auto bg-white rounded-2xl p-[32px]"
                name="cycle-form">
                <div className="flex flex-row items-center gap-4 w-full">
                    <FontAwesomeIcon icon={faArrowsSpin} className="text-blue-600 text-2xl" />
                    <h3 className="text-xl font-bold text-blue-600 flex-1">Nouveau cycle</h3>
                </div>
                <div className="w-full h-[1px] bg-blue-600/10"></div>
                <FieldContainer>
                    <Label>Dates de début et de fin du cycle</Label>
                    <DateRangeInput 
                        name="cycle-range"
                        format="MM/yyyy"
                        value={dateRange}
                        onChange={handleChange}
                    />
                </FieldContainer>
                <div className="flex flex-row gap-4 w-full">
                    <Button
                        fullWidth
                        role="secondary"
                        onClick={handleClose}>
                        Annuler
                    </Button>
                    <Button
                        fullWidth
                        icon={faFloppyDisk}
                        onClick={handleSubmit}>
                        Sauver
                    </Button>
                </div>
            </form>
        </ModalContainer>
    )
}

export default CycleFormModal