import { OnSelectHandler } from "@components/form-elements/select"
import { getFilterLabel, SearchFilterProps } from "@conf/api/search";
import FilterWrapper from "./filter-wrapper";
import ItemComboBox from "@components/radix/item-combobox";


const SelectFilter = (
    {
        name,
        filter,
        onChange,
        onToggle
    }: SearchFilterProps
) => {


    const { conf } = filter


    // handlers

    const handleChange: OnSelectHandler = optionValue => onChange(name, optionValue)

    return (
        <FilterWrapper
            filterName={name}
            label={getFilterLabel(name, conf)}
            onCheckToggle={onToggle}
            checked={filter.checked}
        >
            <ItemComboBox
                itemType={conf.type}
                onChange={handleChange}
                selected={filter.value}
            />
        </FilterWrapper>
    )
}

export default SelectFilter