import { FormFieldProps } from "@utils/types"
import { useState } from "react"

interface Props extends FormFieldProps<Date> {
    // this prop determines whether the user is allowed to
    // select a single month, year or day
    // or whether they're obliged to select a complete date
    // ==> (DD/MM/YY)
    strict?: boolean;
}

const DateInput = (
    {
        value,
        strict = true,
        onChange
    }: Props
) => {

    // state

    const [date, setDate] = useState(value ? value : new Date())



    return (
        <input 
            type="date" 
            onChange={() => onChange(date)} 
        />
    )
}

export default DateInput