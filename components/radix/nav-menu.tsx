import Button from "@components/button"
import { IconProp } from "@fortawesome/fontawesome-svg-core"
import { faBars, faBurger, faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import Link from "next/link"

export interface NavMenuItemType {
	label: string
	icon?: IconProp
	onClick?: () => void
	href?: string
	value?: string
	subMenu?: NavMenuItemType[]
	component?: React.ReactNode
}

interface NavMenuItemProps {
	item: NavMenuItemType
}

const NavMenuItem = ({ item }: NavMenuItemProps) => {
	// render

	return item.subMenu ? (
		<DropdownMenuPrimitive.Sub>
			<DropdownMenuPrimitive.SubTrigger>
				{item.label}
				<FontAwesomeIcon
					icon={faChevronRight}
					className="text-blue-600"
				/>
			</DropdownMenuPrimitive.SubTrigger>
		</DropdownMenuPrimitive.Sub>
	) : (
		<DropdownMenuPrimitive.Item
			className={`flex flex-row gap-4 items-center w-full  focus:outline-none text-blue-600 hover:bg-blue-600/10 focus:bg-blue-600/10
            py-[8px] px-4 text-sm rounded-md transition duration-300 ease-in-out cursor-pointer`}
			onSelect={item.onClick}>
			{item.icon ? (
				<FontAwesomeIcon
					icon={item.icon}
					className="text-blue-600"
				/>
			) : (
				<></>
			)}
			{item.href ? <Link href={item.href}>{item.label}</Link> : item.label}
		</DropdownMenuPrimitive.Item>
	)
}

interface NavMenuProps {
	className?: string
	children: any
}

const NavMenu = ({ className, children }: NavMenuProps) => {
	// render

	return (
		<DropdownMenuPrimitive.Root>
			<DropdownMenuPrimitive.Trigger className={className + " outline-none"}>
				<Button
					icon={faBars}
					role="secondary"
					onClick={() => {}}>
					{""}
				</Button>
			</DropdownMenuPrimitive.Trigger>
			<DropdownMenuPrimitive.Portal>
				<DropdownMenuPrimitive.Content
					align="end"
					className="radix-side-top:animate-slide-up radix-side-bottom:animate-slide-down backdrop-blur-lg
                    rounded-md bg-blue-600/10 z-[999]">
					{children}
				</DropdownMenuPrimitive.Content>
			</DropdownMenuPrimitive.Portal>
		</DropdownMenuPrimitive.Root>
	)
}

export { NavMenu, NavMenuItem }
