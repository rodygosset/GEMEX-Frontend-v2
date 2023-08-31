import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

interface Props {
    className?: string;
    children: any;
    options: {
        label: string;
        value: string;
        icon?: IconProp;
        status?: "danger" | "warning" | "success";
    }[];
    onSelect: (option: string) => void;
}

const DropdownMenu = (
    {
        className,
        children,
        options,
        onSelect
    }: Props
) => {

    // render

    return (

        <DropdownMenuPrimitive.Root>
            <DropdownMenuPrimitive.Trigger className={className + " outline-none"}>
                { children }
            </DropdownMenuPrimitive.Trigger>
            <DropdownMenuPrimitive.Portal>
                <DropdownMenuPrimitive.Content 
                    align="end"
                    className="radix-side-top:animate-slide-up radix-side-bottom:animate-slide-down backdrop-blur-lg
                    rounded-md bg-primary/10 z-[999]">
                {
                    options.map((option, index) => (
                        <DropdownMenuPrimitive.Item 
                            key={index}
                            className={`flex flex-row gap-4 items-center w-full  focus:outline-none
                            ${
                                option.status ? 
                                    option.status == "danger" ? "text-error hover:bg-error/10 focus:bg-error/10" :
                                    option.status == "warning" ? "text-warning hover:bg-warning/10 focus:bg-warning/10" :
                                    option.status == "success" ? "text-success hover:bg-success/10 focus:bg-success/10" : ""
                                    : "text-primary hover:bg-primary/10 focus:bg-primary/10"
                            } 
                            py-[8px] px-[16px] text-sm rounded-md transition duration-300 ease-in-out cursor-pointer`}
                            onSelect={() => onSelect(option.value)}>
                        {
                            option.icon ?
                            <FontAwesomeIcon 
                                icon={option.icon} 
                                className={
                                    option.status ? 
                                    option.status == "danger" ? "text-error" :
                                    option.status == "warning" ? "text-warning" :
                                    option.status == "success" ? "text-success" : ""
                                    : "text-primary"
                                }
                            /> 
                            : <></>
                        }
                        {option.label}
                        </DropdownMenuPrimitive.Item>
                    ))
                }
                    
                </DropdownMenuPrimitive.Content>
            </DropdownMenuPrimitive.Portal>
        </DropdownMenuPrimitive.Root>
    )

}

export default DropdownMenu;