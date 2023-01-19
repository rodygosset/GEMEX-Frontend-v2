import styles from "@styles/components/search-filters/filter-wrapper.module.scss"
import Label from "@components/form-elements/label";
import { OnFilterToggleHandler } from "@conf/api/search";
import FilterCheckBox from "./filter-checkbox";


interface Props {
    filterName: string;
    label: string;
    children: any;
    checked: boolean;
    onCheckToggle: OnFilterToggleHandler
}

const FilterWrapper = (
    {
        filterName,
        label,
        children,
        checked,
        onCheckToggle
    }: Props
) => {

    const handleCheckToggle = (newChecked: boolean) => onCheckToggle(filterName, newChecked) 

    return (
        <div className={styles.wrapper}>
            <div className={styles.label}>
                <FilterCheckBox
                    value={checked}
                    onChange={handleCheckToggle}
                />
                <Label>{label}</Label>
            </div>
            { children }
        </div>
    )

}

export default FilterWrapper