
import styles from "@styles/components/form-elements/label.module.scss"

interface Props {
    children?: any;
    htmlFor?: string;
}

const Label = ({ children, htmlFor }: Props) => {

    return (
        <label 
            className={styles.label} 
            htmlFor={htmlFor ? htmlFor : undefined}>
            { children }
        </label>
    )

}

export default Label