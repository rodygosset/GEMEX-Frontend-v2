import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from "react-chartjs-2";

import colors from "@styles/abstracts/_colors.module.scss";


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

interface Props {
    label: string;
    data: number[];
    labels: string[];
}


const BarChart = (
    {
        label,
        data,
        labels
    }: Props
) => {

    // render 

    return (
        <Bar 
            data={{
                labels: ["Moyenne", ...labels],
                datasets: [
                    {
                        label,
                        data: [data.reduce((a, b) => a + b, 0) / data.length, ...data],
                        backgroundColor: colors["primary-400"],
                    }
                ]
            }}
                
        />
    )

}

export default BarChart