import { Bar, CartesianGrid, BarChart as RechartBarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface Props {
    data: { name: string, value: number }[];
    onDownloadLinkReady?: (link: string) => void;
}


const BarChart = (
    {
        data,
        onDownloadLinkReady
    }: Props
) => {

    // render

    return (
        <ResponsiveContainer width="100%" height={300}>
            <RechartBarChart data={data}>
                <XAxis
                    stroke="rgb(37 99 235 / 0.8)"
                    dataKey="name"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="rgb(37 99 235 / 0.8)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={30}
                    domain={[0, (dataMax: number) => dataMax + 1]}
                />
                <CartesianGrid stroke="rgb(37 99 235 / 0.1)" />
                <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 8, 8]} />
            </RechartBarChart>
        </ResponsiveContainer>
    )
}

export default BarChart