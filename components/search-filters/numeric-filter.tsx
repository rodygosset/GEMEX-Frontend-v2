import NumericField from "@components/form-elements/numeric-field"
import { getFilterLabel, numberSearchParam, SearchFilterProps } from "@conf/api/search"
import { useEffect, useState } from "react"
import FilterWrapper from "./filter-wrapper"


const NumericFilter = (
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

    const [value, setValue] = useState(filter.value ? filter.value : numberSearchParam.defaultValue)

    // keep local state updated

    useEffect(() => setValue(filter.value), [filter.value])


    // handlers

    const handleChange = (newValue: number) => onChange(name, newValue)

    // render

    return (
        <FilterWrapper
            filterName={name}
            label={getFilterLabel(name, conf)}
            onCheckToggle={onToggle}
            checked={filter.checked}
        >
            <NumericField
                value={value}
                onChange={handleChange}
                large
            />
        </FilterWrapper>
    )
}

export default NumericFilter