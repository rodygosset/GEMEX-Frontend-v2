
// utility functions for time delta inputs

import { defaultTimeDeltaUnit, TimeDeltaUnit } from "@utils/types"
import { secondsInMonth, secondsInWeek } from "date-fns"


// get appropriate TimeDeltaUnit for given value (in seconds)


export const getDefaultTimeDeltaUnit = (timeDelta?: number): TimeDeltaUnit => {
    // account for undefined
    if(!timeDelta) return defaultTimeDeltaUnit
    if(timeDelta / secondsInMonth >= 1) return "months"
    else if(timeDelta / secondsInWeek >= 1) return "weeks"
    else return "days"
}
