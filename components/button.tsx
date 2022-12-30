
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/components/button.module.scss"
import { MouseEventHandler } from "react";

interface Props {
    children: any;
    onClick: (event?: any) => void;
    type?: "button" | "submit" | "reset" | undefined;
    role?: "primary" | "secondary" | "tertiary";
    icon?: IconProp;
    active?: boolean;
    animateOnHover?: boolean;
    bigPadding?: boolean;
    fullWidth?: boolean;
    status?: "success" | "danger" | "discouraged";
}

const Button = ({ 
        children, 
        onClick, 
        type, 
        role, 
        icon, 
        active = true, 
        animateOnHover = true, 
        bigPadding, 
        fullWidth,
        status
    }: Props) => {

    const getClassNames = () => {
        let classNames = styles.button
        classNames += (active ? ' ' + styles.active : '') 
        classNames += (animateOnHover ? ' ' + styles.animateOnHover : '') 
        classNames += (bigPadding ? ' ' + styles.bigPadding : '') 
        classNames += (fullWidth ? ' ' + styles.fullWidth : '')
        classNames += ' ' + (role ? styles[role] : styles.primary)
        classNames += (status ? ' ' + styles[status] : '')
        return classNames
    }

    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault()
        if(active) onClick(event)
    }

    return (
        <button
            className={getClassNames()}
            onClick={handleClick}
            type={type}>
            { icon && <FontAwesomeIcon icon={icon} /> }
            { children }
        </button>
    )
}

export default Button