import Button from "@components/button";
import { faArrowRight, faChartPie } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NextPage } from "next";
import Link from "next/link";


const Home: NextPage = () => {

    return (
        <main className="flex flex-col px-[7%]">
            <div className="flex flex-row items-center gap-8">
                <FontAwesomeIcon icon={faChartPie} className="text-5xl text-primary" />
                <div className="flex flex-col w-full">
                    <h1 className="text-2xl text-primary font-semibold h-fit">Taux Qualité</h1>
                    <p className="text-md text-primary text-opacity-40 tracking-[.32rem]">TABLEAU DE BORD</p>
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
        </main>
    )

}


export default Home