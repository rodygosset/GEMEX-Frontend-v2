import Select, { OnSelectHandler } from "@components/form-elements/select"
import { getFilterLabel, SearchFilterProps } from "@conf/api/search";
import useAPIRequest from "@hook/useAPIRequest";
import { capitalizeEachWord } from "@utils/general";
import { SelectOption } from "@utils/react-select/types";
import { AxiosError, AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import FilterWrapper from "./filter-wrapper";
import { MySession } from "@conf/utility-types";
import { useSession } from "next-auth/react";
import ItemMultiSelectCombobox from "@components/radix/item-multi-select-combobox";


// todo: finish this component

const MultiSelectFilter = (
    {
        name,
        filter,
        onChange,
        onToggle
    }: SearchFilterProps
) => {

    // state

    const [selected, setSelected] = useState<string[]>(filter.value)
    
    
    const { conf } = filter

    // get the already selected options from the API

    const makeAPIRequest = useAPIRequest()
    const session = useSession().data as MySession | null

    const getSelectedOption = async (label: string) => {
        if(!conf.item || !session) return
    
        return await makeAPIRequest<any, SelectOption>(
            session,
            "get",
            conf.item,
            label,
            undefined,
            res => ({
                label,
                value: res.data.id
            })
        )
    }

    // handlers

    const handleChange: OnSelectHandler<string[]> = optionValue => onChange(name, optionValue)

    const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>()

    useEffect(() => {
        if(!selectedOptions) return
        handleChange(selectedOptions.map(option => option.label))
    }, [selectedOptions])

    const [defaultValuesLoaded, setDefaultValuesLoaded] = useState(false)

    useEffect(() => {
        if(!conf.item || !session || defaultValuesLoaded || !filter.value) return

        const getSelectedOptions = async () => {
            const selectedOptions: SelectOption[] = []
            for(const label of filter.value) {
                const option = await getSelectedOption(label)
                if(option && !(option instanceof Error)) selectedOptions.push(option)
            }
            setSelectedOptions(selectedOptions)
            setDefaultValuesLoaded(true)
        }

        getSelectedOptions()
    }, [session])

    
    // render

    return conf.item ? (
        <FilterWrapper
            filterName={name}
            label={getFilterLabel(name, conf)}
            onCheckToggle={onToggle}
            checked={filter.checked}
        >
            <ItemMultiSelectCombobox
                itemType={conf.item}
                onSelect={setSelectedOptions}
                selected={selectedOptions?.map(option => option.value as number)}
            />
        </FilterWrapper>
    ) : <></>
}

export default MultiSelectFilter