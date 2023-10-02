import { getFilterLabel, numberSearchParam, SearchFilterProps } from "@conf/api/search"
import { Context } from "@utils/context"
import { getOperatorOption, hasNumberOperatorParam, operatorOptions } from "@utils/form-elements/time-delta-input"
import { useContext, useEffect, useState } from "react"
import FilterWrapper from "./filter-wrapper"
import { cn } from "@utils/tailwind"
import NumberInput from "@components/radix/number-input"
import DropdownMenu from "@components/radix/dropdown-menu"


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
            inline
            filterName={name}
            label={getFilterLabel(name, conf)}
            onCheckToggle={onToggle}
            checked={filter.checked}
        >
            { 
                // only render the operator selector if the current parameter
                // has a corresponding number operator param for the current item type
                hasNumberOperatorParam(name, searchParams["item"]?.toString()) ?
                <DropdownMenu
                    options={operatorOptions}
                    onSelect={handleOperatorChange}
                >
                    <span className={cn(
                        "w-[32px] h-[32px] rounded-[4px] border border-blue-600/20",
                        "text-xs text-blue-600 flex justify-center items-center",
                    )}>
                    {operator.label}
                    </span>
                </DropdownMenu>
                :
                <></>
            }
            <NumberInput
                value={value}
                onChange={handleChange}
            />
        </FilterWrapper>
    )
}

export default NumericFilter