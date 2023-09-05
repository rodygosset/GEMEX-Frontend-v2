import { Cycle } from "@conf/api/data-types/quality-module";

interface Props {
    cycle: Cycle;
    expositionId: number;
}

const ExpositionListItem = (
    {
        cycle,
        expositionId
    }: Props
) => {


    // render

    return (
        <li
            className="flex-1 rounded-[8px] hover:bg-primary/10 transition duration-300 ease-in-out cursor-pointer flex flex-col p-[16px] whitespace-nowrap"
            key={`${cycle.id}-${expositionId}`}>

        </li>
    )

}

export default ExpositionListItem