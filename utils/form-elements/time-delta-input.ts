
// utility functions for time delta inputs

import { searchConf } from "@conf/api/search"
import { SelectOption } from "@utils/react-select/types"
import { defaultTimeDeltaUnit, TimeDeltaObj, TimeDeltaUnit } from "@utils/types"
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


// convert a number to a time delta object
// delta is a number of seconds

export const numberToDelta = (delta: number) => {

    let timeDelta: TimeDeltaObj = {}
    
    // compute the number of months, weeks & days that the number represents

    let remainder = delta

    if(remainder >= secondsInMonth) {
        timeDelta.months = Math.floor(remainder / secondsInMonth)
        remainder = timeDelta.months % secondsInMonth
    }
    if(remainder >= secondsInWeek) {
        timeDelta.weeks = Math.floor(remainder / secondsInWeek)
        remainder = timeDelta.weeks % secondsInWeek
    }
    if(remainder >= secondsInDay) {
        timeDelta.days = Math.floor(remainder / secondsInDay)
    }

    return timeDelta

}


// convert a time delta object to a human readable string

export const deltaToString = (delta: TimeDeltaObj) => {
    let deltaString = ""
    // check for months
    if(typeof delta.months !== "undefined") {
        deltaString += `${delta.months} mois`
        // add a comma if there are more units
        if(typeof delta.weeks !== "undefined"
        || typeof delta.days !== "undefined") {
            deltaString += ", "
        }
    }
    // check for weeks
    if(typeof delta.weeks !== "undefined") {
        deltaString += `${delta.weeks} semaine`
        // determine if it should be plural
        deltaString += delta.weeks > 1 ? 's' : ''
        // add a comma if there are more units
        if(typeof delta.days !== "undefined") {
            deltaString += ", "
        }
    }
    // check for weeks
    if(typeof delta.days !== "undefined") {
        deltaString += `${delta.days} jour`
        // determine if it should be plural
        deltaString += delta.days > 1 ? 's' : ''
    }
    return deltaString
}