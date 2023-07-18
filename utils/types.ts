
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


export interface UserManagementCardProps<T> {
    data: T;
    listView: boolean;
    onClick: () => void;
}

export interface UserManagementViewModalProps<T> {
    data?: T;
    isVisible: boolean;
    closeModal: () => void; 
    refresh: () => void;
}


export interface DateRange {
    startDate: Date;
    endDate: Date;
}

export interface APIDateRange {
    date_debut: string;
    date_fin?: string;
}