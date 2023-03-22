import styles from "@styles/components/operations-dashboard/no-result.module.scss"
import Image from "next/image"

interface Props {
    children: any;
}


// this component is simply used to display an illustration & a message
// that let the user know there are no result to a request that was made to the API

const NoResult = (
    {
        children
    }: Props
) => {


    // render

    return (
        <div className={styles.noResult}>
            <div className={styles.illustrationContainer}>
                <Image 
                    quality={100}
                    src={'/images/void.svg'} 
                    alt={"Aucune résultat"} 
                    priority
                    fill
                    style={{ 
                        objectFit: "contain", 
                        top: "auto"
                    }}
                />
            </div>
            <p>{ children }</p>
        </div>
    )
}


export default NoResult