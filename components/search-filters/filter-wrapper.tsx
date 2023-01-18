import Label from "@components/form-elements/label";
import { OnFilterToggleHandler } from "@conf/api/search";
import FilterCheckBox from "./filter-checkbox";


interface Props {
    filterName: string;
    label: string;
    children: any;
    checked?: boolean;
    onCheckToggle: OnFilterToggleHandler
}

const FilterWrapper = (
    {
        filterName,
        label,
        children,
        checked = false,
        onCheckToggle
    }: Props
) => {

    const handleCheckToggle = (newChecked: boolean) => onCheckToggle(filterName, newChecked) 

    return (
        <div>
            <FilterCheckBox
                value={checked}
                onChange={handleCheckToggle}
            />
            <Label>{label}</Label>
            { children }
        </div>
    )

}

export default FilterWrapper