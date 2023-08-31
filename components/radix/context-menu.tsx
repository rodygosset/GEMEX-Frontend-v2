import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DropdownMenu from "./dropdown-menu";


interface Props {
    className?: string;
    options: {
        label: string;
        value: string;
        icon?: IconProp;
        status?: "danger" | "warning" | "success";
    }[];
    onSelect: (option: string) => void;
}

const ContextMenu = (
    {
        className,
        options,
        onSelect
    }: Props
) => {

    return (
        <DropdownMenu
            className={className}
            options={options}
            onSelect={onSelect}>
            <div className="h-[40px] w-[40px] flex items-center justify-center rounded-full border border-primary/20
hover:bg-primary/10">
                <FontAwesomeIcon icon={faEllipsisVertical} className="text-primary" />
            </div>
        </DropdownMenu>
    )

}

export default ContextMenu