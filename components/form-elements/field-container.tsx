
import styles from "@styles/components/form-elements/field-container.module.scss"

interface Props {
    children: any;
    fullWidth?: boolean;
    row?: boolean;
}

const FieldContainer = ({ children, fullWidth, row }: Props) => {

    const getClassNames = () => {
        let classNames =  styles.fieldContainer 
        classNames += (fullWidth ? ' ' + styles.fullWidth : '')
        classNames += (row ? ' ' + styles.row : '')
        return classNames
    }

    return (
        <div className={getClassNames()}>
            { children }
        </div>
    )
}

export default FieldContainer