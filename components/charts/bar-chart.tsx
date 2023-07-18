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
import { useEffect, useRef } from 'react';
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';


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
    onDownloadLinkReady?: (link: string) => void;
}


const BarChart = (
    {
        label,
        data,
        labels,
        onDownloadLinkReady
    }: Props
) => {

    const chartRef = useRef<ChartJSOrUndefined<"bar">>(null)

    // effects

    useEffect(() => {
        
        const link = chartRef.current?.toBase64Image('image/png', 3.0)
        if(link && onDownloadLinkReady) onDownloadLinkReady(link)

    }, [chartRef.current, onDownloadLinkReady, label, data, labels])


    // render 

    return (
        <Bar 
            ref={chartRef}
            data={{
                labels,
                datasets: [
                    {
                        label,
                        data,
                        backgroundColor: colors["primary-400"],
                    }
                ]
            }}
            options={{
                animation: {
                    onComplete: () => {
                        const link = chartRef.current?.toBase64Image('image/png', 3.0)
                        if(link && onDownloadLinkReady) onDownloadLinkReady(link)
                    }
                }
            }}
                
        />
    )

}

export default BarChart