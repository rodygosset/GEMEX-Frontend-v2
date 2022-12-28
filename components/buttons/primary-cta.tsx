
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "@styles/components/buttons/primary-cta.module.scss"
import { MouseEventHandler } from "react";

interface Props {
    children: any;
    onClick: MouseEventHandler<HTMLButtonElement>
    icon?: IconProp;
    bigPadding?: boolean;
    fullWidth?: boolean;
}

const PrimaryCTA = ({ children, onClick, icon, bigPadding, fullWidth }: Props) => {

    const getClassNames = () => {
        let classNames =  styles.primaryCTA 
        classNames += (bigPadding ? ' ' + styles.bigPadding : '') 
        classNames += (fullWidth ? ' ' + styles.fullWidth : '')
        return classNames
    }

    return (
        <button
            className={getClassNames()}
            onClick={onClick}>
            { icon && <FontAwesomeIcon icon={icon} /> }
            { children }
        </button>
    )
}

export default PrimaryCTA