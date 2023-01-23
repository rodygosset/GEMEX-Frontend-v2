
// utility functions for time delta inputs

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
