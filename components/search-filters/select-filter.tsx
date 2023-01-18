import Select, { OnSelectHandler } from "@components/form-elements/select"
import { getFilterLabel, OnFilterChangeHandler, OnFilterToggleHandler, SearchParam } from "@conf/api/search";
import useAPIRequest from "@hook/useAPIRequest";
import { capitalizeEachWord, formatItemName } from "@utils/general";
import { SelectOption } from "@utils/react-select/types";
import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import FilterWrapper from "./filter-wrapper";


interface Props {
    name: string;
    conf: SearchParam;
    defaultValue?: number;
    onChange: OnFilterChangeHandler;
    onToggle: OnFilterToggleHandler;
}


const SelectFilter = (
    {
        name,
        conf,
        defaultValue,
        onChange,
        onToggle
    }: Props
) => {

    // state

    const [options, setOptions] = useState<SelectOption[]>([])
    const [selected, setSelected] = useState<number>()
    
    const [isLoading, setIsLoading] = useState(true)

    // Fetch the data from the API 
    // & convert it into a list of options

    const makeAPIRequest = useAPIRequest()

    useEffect(() => {

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
                    optionLabel = formatItemName(item[mainAttr])
                }
                return { value: item.id, label: optionLabel }
            }))

            // if a default value was provided,
            // load it
            if(defaultValue) {
                setSelected(res.data[defaultValue - 1].id)
            }
        }

        // make our API request

        makeAPIRequest(
            "get",
            conf.type,
            undefined,
            undefined,
            handleReqSucess
        )

    }, [])

    // handlers

    const handleChange: OnSelectHandler = optionValue => {
        setSelected(optionValue as number)
        onChange(name, optionValue)
    }

    return (
        <FilterWrapper
            filterName={name}
            label={getFilterLabel(conf)}
            onCheckToggle={onToggle}
        >
            <Select
                name={name}
                options={options}
                isLoading={isLoading}
                defaultValue={conf.defaultValue}
                value={selected}
                onChange={handleChange}
            />
        </FilterWrapper>
    )
}

export default SelectFilter