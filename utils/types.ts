
export type DynamicObject = { [key: string]: any }


export interface FormFieldProps<T = any> {
    value: T;
    onChange: (newValue: T) => void;
}