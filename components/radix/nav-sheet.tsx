import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTrigger } from "./sheet";
import { faBarsStaggered, faGem, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import UserCard from "@components/layout/header/user-card";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { useState } from "react";

interface Props {
    navItems: NavItemType[];
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

    // utils

    const router = useRouter()

    const isCurrentRoute = () => {
        // include also subroutes
        return (item.href && router.pathname.includes(item.href) && item.href != "/") || item.href == router.pathname
    }

    // render

    return (
        <div 
            onClick={item.onClick}
            className={`flex flex-row gap-4 items-center w-full  focus:outline-none ${isCurrentRoute() ? "text-white bg-white/10" : "text-white/60"} hover:bg-white/10 focus:bg-white/10
        py-[8px] px-[16px] text-sm font-normal rounded-md transition duration-300 ease-in-out cursor-pointer`}>
        {
            item.icon ?
            <FontAwesomeIcon 
                icon={item.icon} 
                className={`${isCurrentRoute() ? "text-white" : "text-white/60"} text-sm`}
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
        navItems
    }: Props
) => {

    const [isOpen, setIsOpen] = useState(false)

    // render

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger>
                <span className="p-[12px] flex flex-row justify-center items-center rounded-[8px] hover:bg-blue-600/10 cursor-pointer
                                    border border-primary/10">
                    <FontAwesomeIcon icon={faBarsStaggered} className="w-[20px] h-[20px] text-blue-600" />
                </span>
            </SheetTrigger>
            <SheetContent className="max-sm:w-full flex flex-col gap-4 bg-blue-900" side="left">
                <SheetHeader className="mb-[32px]">
                    <p className="text-base font-semibold text-white flex flex-row items-center gap-8 p-[8px]">
                        <FontAwesomeIcon icon={faGem} />
                        GEMEX
                    </p>
                </SheetHeader>

                <UserCard className="mb-[32px]" dark />
                {
                    navItems.map((item, index) => (
                        <NavItem 
                            key={index} 
                            item={{...item, onClick: () => {
                                setIsOpen(false)
                                item.onClick ? item.onClick() : null
                            }}}
                        />
                    ))
                }
                <SheetFooter className="flex-1 justify-end gap-8 pb-[32px] px-[16px]">
                        <button 
                            className="text-sm font-normal text-white/60 hover:text-white transition duration-300 ease-in-out hover:bg-white/10
                                flex flex-row gap-4 px-[16px] py-[8px] rounded-[8px] items-center focus:outline-none border border-white/10"
                            onClick={() => signOut()}>
                                <FontAwesomeIcon icon={faRightFromBracket} />
                            Se déconnecter
                        </button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export { NavSheet, NavItem}