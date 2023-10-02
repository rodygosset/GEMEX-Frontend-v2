import { getUserFullName } from "@conf/api/data-types/user"
import { MySession } from "@conf/utility-types"
import { cn } from "@utils/tailwind"
import { useSession } from "next-auth/react"
import Image from "next/image"

import { capitalizeFirstLetter } from "utils/general"

interface Props {
    className?: string;
    dark?: boolean;
}

const UserCard = (
    {
        className,
        dark
    }: Props
) => {

    const session = useSession().data as MySession | null

    const userRole = session?.userRole

    return (
        <div className={cn(
            "flex items-center gap-[16px]",
            className
        )}>
            <div className="relative w-[48px] h-[48px]">
                <Image 
                    quality={100}
                    src={'/images/male-user-illustration.svg'} 
                    alt={"Utilisateur de GEMEX"} 
                    priority
                    fill
                    style={{ 
                        objectFit: "contain", 
                        top: "auto"
                    }}
                />
            </div>
            {
                session ?
                <div className="flex flex-col">
                    <span className={`text-base font-normal ${dark ? "text-neutral-50/80" : "text-blue-600"}`}>
                        {getUserFullName(session?.user)}
                    </span>
                    <span className={`text-sm font-normal ${dark ? "text-neutral-50/40" : "text-blue-600/40"}`}>
                        {userRole ? capitalizeFirstLetter(userRole.titre) : ""}
                    </span>
                </div>
                :
                <></>
            }

        </div>
    )
}

export default UserCard