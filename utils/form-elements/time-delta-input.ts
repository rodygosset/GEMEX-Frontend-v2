
// utility functions for time delta inputs

import { searchConf } from "@conf/api/search"
import { SelectOption } from "@utils/react-select/types"
import { defaultTimeDeltaUnit, TimeDeltaUnit } from "@utils/types"
import { secondsInDay, secondsInMonth, secondsInWeek } from "date-fns"


// get appropriate TimeDeltaUnit for given value (in seconds)


export const getDefaultTimeDeltaUnit = (timeDelta?: number): TimeDeltaUnit => {
    // account for undefined
    if(!timeDelta) return defaultTimeDeltaUnit
    // firstly, try with exact values
    if(timeDelta % secondsInMonth == 0) return "months"
    else if(timeDelta % secondsInWeek == 0) return "weeks"
    else if(timeDelta % secondsInDay == 0) return "days"
    // if the time delta doesn't exactly match any unit, 
    // try to find the most appropriate one
    else if(timeDelta / secondsInMonth >= 1) return "months"
    else if(timeDelta / secondsInWeek >= 1) return "weeks"
    else return "days"
}

export const operatorOptions: SelectOption<string>[] = [
    { value: "=", label: "=" },     // equal
    { value: "<", label: "<" },     // lesser than
    { value: "<=", label: "<=" },   // strictly lesser than
    { value: ">", label: ">" },     // greater than
    { value: ">=", label: ">=" }    // strictly greater than
] 

export const defaultOperator = "="


// get operator option from operator value

export const getOperatorOption = (val: string) => {
    let option = operatorOptions.find(option => option.value == val)
    return option ? option : operatorOptions[0]
}

// only render the operator selector if the current parameter
// has a corresponding number operator param for the current item type

export const hasNumberOperatorParam = (paramName: string, itemType?: string) => {
    // don't try this if the item type hasn't been loaded yet
    // ==> fool-proofing
    if(!itemType) return false
    const operatorParamName = paramName + "_operator"
    return operatorParamName in searchConf[itemType].searchParams
}
