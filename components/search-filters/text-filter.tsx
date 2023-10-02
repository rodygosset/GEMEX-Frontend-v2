import TextInput from "@components/form-elements/text-input"
import { getFilterLabel, SearchFilterProps } from "@conf/api/search"
import FilterWrapper from "./filter-wrapper"
import { Input } from "@components/radix/input"


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
            <Input
                className="bg-transparent border border-blue-600/20 text-blue-600/80 placeholder:text-blue-600/40 rounded-[8px]"
                placeholder={placeholder}
                onChange={e => handleChange(e.target.value)}
                name={name}
                value={filter.value}
            />
        </FilterWrapper>
    )
}

export default TextFilter