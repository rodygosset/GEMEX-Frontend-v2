import { ChangeEventHandler } from "react";


interface Props {
    value: boolean;
    onChange: (value: boolean) => void
}

const FilterCheckBox = (
    {
        value,
        onChange
    }: Props
) => {

    const handleChange: ChangeEventHandler<HTMLInputElement> = e => {
        e.preventDefault()
        onChange(e.target.checked)
    }

    return (
        <input type="checkbox" checked={value} onChange={handleChange} />
    )

}


export default FilterCheckBox