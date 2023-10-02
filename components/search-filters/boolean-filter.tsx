import { getFilterLabel, SearchFilterProps } from "@conf/api/search"
import { useEffect, useState } from "react"
import FilterWrapper from "./filter-wrapper"
import { Checkbox } from "@components/radix/checkbox"


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
            inline
            filterName={name}
            label={getFilterLabel(name, conf)}
            onCheckToggle={onToggle}
            checked={filter.checked}
        >
            <Checkbox
                value={value ? 1 : 0}
                onCheckedChange={handleChange}
            />
        </FilterWrapper>
    )

}

export default BooleanFilter