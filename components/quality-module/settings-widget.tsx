import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import DashboardWidget from "./widgets/dashboard-widget"
import { faGear } from "@fortawesome/free-solid-svg-icons"



const SettingsWidget = () => {


    // render

    return (
        <DashboardWidget
            title="Thématiques"
            caption="Paramétrer & modifier les thématiques d’évaluation"
            link="/quality/settings">
            
            <div className="h-full min-h-[240px] w-full flex flex-col items-center justify-center gap-4">
                <FontAwesomeIcon icon={faGear} className="text-purple-600 text-[90px]" />
                <p className="text-base font-normal text-purple-600/60">Gestion & ajustements</p>
            </div>

        </DashboardWidget>
    )

}

export default SettingsWidget