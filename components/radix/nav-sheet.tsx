import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "./sheet";
import { faBarsStaggered } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import UserCard from "@components/layout/header/user-card";
import Link from "next/link";

interface Props {
    children: any;
}


export interface NavItemType {
    label: string;
    icon?: IconProp;
    onClick?: () => void;
    href?: string;
    value?: string;
}

interface NavItemProps {
    item: NavItemType;
}

const NavItem = (
    {
        item
    }: NavItemProps
) => {

    // render

    return (
        <div 
            onClick={item.onClick}
            className="flex flex-row gap-4 items-center w-full  focus:outline-none text-primary/60 hover:bg-primary/10 focus:bg-primary/10
        py-[8px] px-[16px] text-sm rounded-md transition duration-300 ease-in-out cursor-pointer">
        {
            item.icon ?
            <FontAwesomeIcon 
                icon={item.icon} 
                className="text-primary/60 text-sm"
            /> 
            : <></>
        }
        {
            item.href ?
            <Link 
                href={item.href}>
                    {item.label}
            </Link>
            : item.label
        }
        </div>
    )
}

const NavSheet = (
    {
        children
    }: Props
) => {


    return (
        <Sheet>
            <SheetTrigger>
                <span className="p-[12px] flex flex-row justify-center items-center rounded-[8px] hover:bg-primary/10 cursor-pointer
                                    border border-primary/10">
                    <FontAwesomeIcon icon={faBarsStaggered} className="w-[20px] h-[20px] text-primary" />
                </span>
            </SheetTrigger>
            <SheetContent className="max-sm:w-full flex flex-col gap-4">
                <SheetHeader className="mb-[16px]">
                    <UserCard />
                </SheetHeader>
                <div className="w-full h-[1px] bg-primary/10 rounded-lg"/>
                {children}
            </SheetContent>
        </Sheet>
    )
}

export { NavSheet, NavItem}