import NumericField from "@components/form-elements/numeric-field"
import Select from "@components/form-elements/select"
import { getFilterLabel, numberSearchParam, SearchFilterProps } from "@conf/api/search"
import { Context } from "@utils/context"
import { getOperatorOption, hasNumberOperatorParam, operatorOptions } from "@utils/form-elements/time-delta-input"
import { useContext, useEffect, useState } from "react"
import FilterWrapper from "./filter-wrapper"
import { numberOperatorSelectStyles } from "./time-delta-filter"


const NumericFilter = (
    {
        name,
        filter,
        onChange,
        onToggle,
        getOperatorValue,
        setOperatorValue
    }: SearchFilterProps
) => {

    const { conf } = filter

    // state & effects

    // load the default value

    const [value, setValue] = useState(filter.value ? filter.value : numberSearchParam.defaultValue)

    // keep local state updated

    useEffect(() => setValue(filter.value), [filter.value])

    // keep track of the comparison operator

    // get the default operator from the corresponding search filter
    // if there is one

    const { searchParams } = useContext(Context)

    const getDefaultOperator = () => {
        if(!hasNumberOperatorParam(name, searchParams["item"]?.toString())
        || !getOperatorValue) return operatorOptions[0] 
        return getOperatorOption(getOperatorValue(name))
    }

    const [operator, setOperator] = useState(getDefaultOperator())

    // keep the operator filter up to date

    useEffect(() => {
        if(setOperatorValue) setOperatorValue(name, operator.value)
    }, [operator])

    // handlers

    const handleChange = (newValue: number) => onChange(name, newValue)

    // update the operator option on change

    const handleOperatorChange = (newValue: string) => {
        // find the option corresponding to the operator value
        const option = operatorOptions.find(option => option.value == newValue)
        if(!option) return
        // when found, update the state variable
        setOperator(option)
    }

    // render

    return (
        <FilterWrapper
            filterName={name}
            label={getFilterLabel(name, conf)}
            onCheckToggle={onToggle}
            checked={filter.checked}
        >
            { 
                // only render the operator selector if the current parameter
                // has a corresponding number operator param for the current item type
                hasNumberOperatorParam(name, searchParams["item"]?.toString()) ?
                <Select
                    name={name}
                    options={operatorOptions}
                    onChange={handleOperatorChange}
                    defaultValue={operator.value}
                    customStyles={numberOperatorSelectStyles}
                    isSearchable={false}
                />
                :
                <></>
            }
            <NumericField
                value={value}
                onChange={handleChange}
                large
            />
        </FilterWrapper>
    )
}

export default NumericFilter