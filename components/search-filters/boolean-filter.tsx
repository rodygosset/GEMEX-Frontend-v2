import CheckBox from "@components/form-elements/checkbox"
import { getFilterLabel, SearchFilterProps } from "@conf/api/search"
import { useEffect, useState } from "react"
import FilterWrapper from "./filter-wrapper"


const BooleanFilter = (
    {
        name,
        filter,
        onChange,
        onToggle
    }: SearchFilterProps
) => {

    const { conf } = filter

    // state & effects

    // load the default value

    const [value, setValue] = useState(filter.value ? filter.value : false)

    // keep local state updated

    useEffect(() => setValue(filter.value), [filter.value])

    // handlers

    const handleChange = (newValue: boolean) => onChange(name, newValue)

    // render

    return (
        <FilterWrapper
            filterName={name}
            label={getFilterLabel(name, conf)}
            onCheckToggle={onToggle}
            checked={filter.checked}
        >
            <CheckBox
                value={value}
                onChange={handleChange}
            />
        </FilterWrapper>
    )

}

export default BooleanFilter