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
                labels,
                datasets: [
                    {
                        label,
                        data
                    }
                ]
            }}
        />
    )

}

export default BarChart