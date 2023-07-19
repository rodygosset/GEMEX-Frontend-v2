
import styles from "@styles/components/form-elements/expo-opening-period-input.module.scss"
import { APIDateRange } from "@utils/types"

interface Props {
    value: APIDateRange[];
}

const ExpoOpeningPeriodsList = (
    {
        value
    }: Props
) => {


    // render

    return (
        <div 
            style={{
                width: "100%"
            }}
            className={styles.container}>
        {
            value.length > 0 ?
            <ul>
            {
                    value.map((period, i) => (
                        <li key={`period-${i}`}>
                        {
                            period.date_fin ?
                            <p>Du <span>{new Date(period.date_debut).toLocaleDateString("fr")}</span> au <span>{new Date(period.date_fin).toLocaleDateString("fr")}</span></p>
                            :
                            <p>À partir du <span>{new Date(period.date_debut).toLocaleDateString("fr")}</span></p>
                        }
                        </li>
                    ))
                }
            </ul>
            :
            <p className={styles.noData}>Aucune période d'ouverture</p>
        }
        </div>
    )

}

export default ExpoOpeningPeriodsList