
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "@styles/components/form-elements/submit-button.module.scss"
import { MouseEventHandler } from "react";

interface Props {
    value: string;
    icon?: IconProp;
    onSubmit: MouseEventHandler<HTMLInputElement>;
    bigPadding?: boolean;
    fullWidth?: boolean;
}

const SubmitButton = ({ value, icon, onSubmit, bigPadding, fullWidth }: Props) => {

    const getClassNames = () => {
        let classNames = styles.submitButton 
        classNames += (bigPadding ? ' ' + styles.bigPadding : '') 
        classNames += (fullWidth ? ' ' + styles.fullWidth : '')
        return classNames
    }

    return (
        <>
            {
                icon ?

                <div className={getClassNames()} onClick={onSubmit}>
                    <FontAwesomeIcon icon={icon}/>
                    <input
                        type="submit" 
                        value={value} 
                    />
                </div>

                :

                <input 
                    className={getClassNames()}
                    type="submit" 
                    value={value} 
                    onClick={onSubmit} 
                />
            }
        </>
        
    )

}

export default SubmitButton