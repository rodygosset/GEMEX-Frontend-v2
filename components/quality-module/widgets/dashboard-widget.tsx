import SectionContainer from "@components/layout/quality/section-container"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";


interface Props {
    title: string;
    caption: string;
    link?: string;
    children: any;
}

const DashboardWidget = (
    {
        title,
        caption,
        link,
        children
    }: Props
) => {


    // render

    return (
        <SectionContainer>
            <div className="w-full flex flex-row justify-between content-center gap-2">
                <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-blue-600">{title}</h3>
                    <p className="text-sm font-normal text-blue-600 text-opacity-60">{caption}</p>
                </div>
                {
                    link ?
                    <Link
                        className="flex flex-row items-center justify-center rounded-full min-w-[60px] w-[60px] h-[60px] border border-primary/20
                            hover:bg-blue-600/10  transition duration-300 ease-in-out cursor-pointer" 
                        href={link}>
                        <FontAwesomeIcon icon={faArrowRight} className="text-blue-600 text-xl" />
                    </Link> 
                    : <></>
                }
            </div>
            {children}
        </SectionContainer>
    )
}

export default DashboardWidget