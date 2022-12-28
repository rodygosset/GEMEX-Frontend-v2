
import styles from "@styles/components/form-elements/field-container.module.scss"

interface Props {
    children: any;
    fullWidth?: boolean;
}

const FieldContainer = ({ children, fullWidth }: Props) => {

    const getClassNames = () => {
        let classNames =  styles.fieldContainer 
        classNames += (fullWidth ? ' ' + styles.fullWidth : '')
        return classNames
    }

    return (
        <div className={getClassNames()}>
            { children }
        </div>
    )
}

export default FieldContainer