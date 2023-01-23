import Select, { OnSelectHandler } from "@components/form-elements/select"
import { getFilterLabel, SearchFilterProps } from "@conf/api/search";
import useAPIRequest from "@hook/useAPIRequest";
import { capitalizeEachWord } from "@utils/general";
import { SelectOption } from "@utils/react-select/types";
import { AxiosError, AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import FilterWrapper from "./filter-wrapper";


const MultiSelectFilter = (
    {
        name,
        filter,
        onChange,
        onToggle
    }: SearchFilterProps
) => {

    // state

    const [options, setOptions] = useState<SelectOption[]>([])
    const [selected, setSelected] = useState<string[]>(filter.value)
    
    const [isLoading, setIsLoading] = useState(true)

    // Fetch the data from the API 
    // & convert it into a list of options

    const makeAPIRequest = useAPIRequest()

    useEffect(() => {

        if(!conf.item) return

        // start with making a request to the API

        const handleReqSucess = (res: AxiosResponse<any[]>) => {
            setIsLoading(false)
            // convert the array of objects into an array of select options

            if(!Array.isArray(res.data) || res.data.length == 0) { return }


            // get the object property we'll use as the label
            let mainAttr = '';
            if('username' in res.data[0]) { mainAttr = 'username' }
            else if('titre' in res.data[0]) { mainAttr = 'titre' }
            else if('nom' in res.data[0]) { mainAttr = 'nom' }
            else { mainAttr = 'id' }

            setOptions(res.data.map(item => {
                // if our options are users
                // display their full name
                let optionLabel: string
                if(mainAttr == 'username') {
                    optionLabel = capitalizeEachWord(item['prenom'] + ' ' + item['nom'])
                } else {
                    optionLabel = capitalizeEachWord(item[mainAttr])
                }
                return { value: item.id, label: optionLabel }
            }))
        }

        // in case there was an error with our request

        const handleReqFailure = (res: Error | AxiosError<unknown, any>) => {
            setIsLoading(false)
        }

        // make our API request

        makeAPIRequest(
            "get",
            conf.item,
            undefined,
            undefined,
            handleReqSucess,
            handleReqFailure,
        )

    }, [])

    // handlers

    const handleChange: OnSelectHandler<string[]> = optionValue => {
        setSelected(optionValue)
        onChange(name, optionValue)
    }

    const { conf } = filter

    return (
        <FilterWrapper
            filterName={name}
            label={getFilterLabel(name, conf)}
            onCheckToggle={onToggle}
            checked={filter.checked}
        >
            <Select
                name={name}
                options={options}
                isLoading={isLoading}
                value={selected}
                onChange={handleChange}
                isMulti
                large
            />
        </FilterWrapper>
    )
}

export default MultiSelectFilter