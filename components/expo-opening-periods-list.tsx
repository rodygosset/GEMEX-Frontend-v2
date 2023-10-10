
import styles from "@styles/components/form-elements/expo-opening-period-input.module.scss"
import { cn } from "@utils/tailwind";
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
        <ul className="w-full flex flex-col rounded-[8px] border border-blue-600/20">
        {
            value.length > 0 ?
            value.map((period, i) => (
                <li 
                    className={cn(
                        "flex-1 p-[16px] text-sm font-normal text-blue-600/80",
                        i == value.length - 1 ? "" : "border-b border-blue-600/20"
                    )}
                    key={i}>
                {
                    period.date_fin ?
                    <span>Du <span className="font-semibold text-blue-600">{new Date(period.date_debut).toLocaleDateString("fr")}</span> au <span className="font-semibold text-blue-600">{new Date(period.date_fin).toLocaleDateString("fr")}</span></span>
                    :
                    <span>À partir du <span className="font-semibold text-blue-600">{new Date(period.date_debut).toLocaleDateString("fr")}</span></span>
                }
                </li>
            ))
            :
            <li className="flex-1 p-[16px] text-sm font-normal text-blue-600/80">Aucune période d'ouverture</li>
        }
        </ul>
    )

}

export default ExpoOpeningPeriodsList