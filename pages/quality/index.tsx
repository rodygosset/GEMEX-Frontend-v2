
import SettingsWidget from "@components/quality-module/settings-widget";
import CurrentCycleWidget from "@components/quality-module/widgets/current-cycle-widget";
import CurrentMonthlyAssessmentWidget from "@components/quality-module/widgets/current-monthly-assessment-widget";
import CyclesWidget from "@components/quality-module/widgets/cycles-widget";
import { faArrowRight, faChartPie } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NextPage } from "next";
import Link from "next/link";


const Home: NextPage = () => {

    return (
        <main className="flex flex-col px-[7%] gap-y-16">
            <div className="flex flex-row items-center gap-8">
                <FontAwesomeIcon icon={faChartPie} className="text-5xl text-primary" />
                <div className="flex flex-col w-full">
                    <h1 className="text-2xl text-primary font-semibold h-fit">Taux Qualité</h1>
                    <p className="text-md text-primary text-opacity-40 tracking-widest">TABLEAU DE BORD</p>
                </div>
                <Link 
                    className="flex flex-row items-center gap-4 w-fit bg-primary bg-opacity-10 rounded-md px-[20px] py-[10px]
                        hover:bg-opacity-20 transition duration-300 ease-in-out cursor-pointer"
                    href="/quality/evaluations/search">
                    <FontAwesomeIcon 
                        icon={faArrowRight} 
                        className="text-sm text-primary"
                    />
                    <span className="text-md font-normal text-primary whitespace-nowrap">Historique des évaluations</span>
                </Link>
            </div>
            <div className="w-full h-full flex flex-col gap-4">
                <div className="flex flex-row gap-4 h-[400px]">
                    <CurrentMonthlyAssessmentWidget 
                    />
                    <CurrentCycleWidget 
                    />
                    <SettingsWidget />
                </div>
                <CyclesWidget 
                    cycles={[]}
                />
            </div>
        </main>
    )

}


export default Home