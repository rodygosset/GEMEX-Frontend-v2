import { Skeleton } from "@components/radix/skeleton";
import { Element } from "@conf/api/data-types/element";
import { Exposition } from "@conf/api/data-types/exposition";
import { Fiche } from "@conf/api/data-types/fiche"
import { User, UserRole } from "@conf/api/data-types/user";
import { MySession } from "@conf/utility-types";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAPIRequest from "@hook/useAPIRequest";
import { cn } from "@utils/tailwind";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image"


interface Props {
    fiche: Fiche;
}

const OperationReportCard = (
    {
        fiche
    }: Props
) => {

    const [item, setItem] = useState<Element | Exposition>()
    const [user, setUser] = useState<User>()
    const [userRole, setUserRole] = useState<string>()

    // get the element from the API
    
    const session = useSession().data as MySession | null
    const makeAPIRequest = useAPIRequest()

    const getFicheItem = async () => {
        if(!session) return
        
        return await makeAPIRequest<typeof item, typeof item>(
            session,
            "get",
            fiche.element_id ? "elements" : "expositions",
            `id/${fiche.element_id ? fiche.element_id : fiche.exposition_id}`,
            undefined,
            res => res.data
        )
    }

    // get the user from the API

    const getFicheUser = async () => {
        if(!session) return

        if(session.user.id === fiche.auteur_id) return session.user

        return await makeAPIRequest<typeof user, typeof user>(
            session,
            "get",
            "users",
            `id/${fiche.auteur_id}`,
            undefined,
            res => res.data
        )
    }

    // get the user role from the API

    const getFicheUserRole = async (role_id: number) => {
        if(!session) return

        if(session.user.id === fiche.auteur_id) return session.userRole.titre

        return await makeAPIRequest<UserRole, typeof userRole>(
            session,
            "get",
            "roles",
            `id/${role_id}`,
            undefined,
            res => res.data.titre
        )
    }

    useEffect(() => {

        getFicheItem().then(data => {
            if(data && !(data instanceof Error)) setItem(data)
        })

        getFicheUser().then(data => {
            if(!data || data instanceof Error) return
            setUser(data)
            getFicheUserRole(data.role_id).then(data => {
                if(!data || data instanceof Error) return
                setUserRole(data)
            })
        })

    }, [fiche, session])
    

    // render

    return item && user ? (
        <article className={cn(
            "w-[320px]",
            "flex flex-col gap-[16px] p-[32px] rounded-[8px] ",
            "bg-neutral-50/10 border border-blue-600/20 shadow-xl shadow-blue-600/10"
        )}>
            {
                fiche.tags.length > 0 ?
                <span className={cn(
                    "text-sm font-normal capitalize tracking-wider text-opacity-60 mb-[-8px]",
                    fiche.tags[0] == "Panne" ? "text-red-700" : "text-blue-600"
                )}>
                    {fiche.tags[0]}
                </span>
                : <></>
            }
            <div className="w-full flex items-center gap-[16px]">
                <div className="w-[192px] flex flex-col">
                    <h4 className="text-xl font-semibold text-blue-600 w-full whitespace-nowrap overflow-hidden text-ellipsis">{fiche.nom}</h4>
                    <span className="text-sm font-normal text-purple-500">{item.nom}</span>
                </div>
                <Link
                    className="w-[48px] h-[48px] aspect-square rounded-[32px] flex items-center justify-center border border-blue-600/20 hover:bg-blue-600/10 transition-colors"
                    href={`/view/fiches/${fiche.id}`}>
                    <FontAwesomeIcon icon={faArrowRight} className="text-base text-blue-600" />
                </Link>
            </div>
            <div className="w-full flex items-center gap-[16px]">
                <div className="relative w-[32px] h-[32px]">
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
                <div className="w-full flex flex-col">
                    <span className="text-sm font-semibold text-blue-600">{user.prenom} {user.nom}</span>
                    <span className="text-xs font-normal text-blue-600/60 capitalize">{userRole}</span>
                </div>
            </div>
        </article>
    ) : 
    <Skeleton className="w-[320px] h-[170px] rounded-[8px] flex flex-col gap-[16px] p-[32px] opacity-80">
        <Skeleton className="w-full h-[16px] rounded-[8px]" />
        <Skeleton className="w-[80%] h-[16px] rounded-[8px] opacity-60" />
        <div className="flex flex-row items-center gap-[16px] pt-[16px]">
            <Skeleton className="w-[32px] h-[32px] aspect-square rounded-[32px]" />
            <div className="w-full flex flex-col gap-[8px]">
                <Skeleton className="w-[80%] h-[12px] rounded-[8px]" />
                <Skeleton className="w-[60%] h-[12px] rounded-[8px] opacity-60" />
            </div>
        </div>
    </Skeleton>
}

export default OperationReportCard