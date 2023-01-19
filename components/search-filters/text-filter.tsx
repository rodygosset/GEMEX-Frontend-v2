import TextInput from "@components/form-elements/text-field"
import { getFilterLabel, SearchFilterProps } from "@conf/api/search"
import FilterWrapper from "./filter-wrapper"


const TextFilter = (
    {
        name,
        filter,
        onChange,
        onToggle
    }: SearchFilterProps
) => {

    const { conf } = filter

    // handlers

    const handleChange = (newValue: string) => onChange(name, newValue)

    // conf

    const placeholder = "Écrire pour filtrer..."

    // render

    return (
        <FilterWrapper
            filterName={name}
            label={getFilterLabel(name, conf)}
            onCheckToggle={onToggle}
            checked={filter.checked}
        >
            <TextInput
                placeholder={placeholder}
                onChange={handleChange}
                name={name}
                currentValue={filter.value}
                bigPadding
            />
        </FilterWrapper>
    )
}

export default TextFilter