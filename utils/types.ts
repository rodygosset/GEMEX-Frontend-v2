
export type DynamicObject = { [key: string]: any }


export interface FormFieldProps<T = any> {
    value: T;
    onChange: (newValue: T) => void;
}


export interface DateInputValue {
    year?: number;
    month?: number;
    day?: number;
}

export type DateFormat = "yyyy" | "MM/yyyy" | "dd/MM/yyyy"

export type TimeDeltaUnit = "days" | "weeks" | "months"

export const defaultTimeDeltaUnit: TimeDeltaUnit = "days"


export interface TimeDeltaObj {
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
}