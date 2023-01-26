import styles from "@styles/components/utils/loading-indicator.module.scss"

const LoadingIndicator = () => {

    return (
        <div className={styles["lds-ripple"]}><div></div><div></div></div>
    )
} 

export default LoadingIndicator