import Button from "@components/button";
import DomaineCard from "@components/cards/quality-module/domaine-card";
import Image from "next/image";
import GoBackButton from "@components/go-back-button";
import DomaineFormModal from "@components/modals/quality-module/domaine-form-modal";
import { Domaine } from "@conf/api/data-types/quality-module";
import { MySession } from "@conf/utility-types";
import { faDownload, faPlus } from "@fortawesome/free-solid-svg-icons";
import SSRmakeAPIRequest from "@utils/ssr-make-api-request";
import { GetServerSideProps, NextPage } from "next"
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useAPIRequest from "@hook/useAPIRequest";

interface Props {
    initDomaines: Domaine[];
}

const Settings: NextPage<Props> = (
    {
        initDomaines
    }: Props
) => {

    useEffect(() => {
        console.log(initDomaines)
    }, [])

    const router = useRouter()

    // state

    const [domaines, setDomaines] = useState<Domaine[]>(initDomaines)

    const [domaineModalIsOpen, setDomaineModalIsOpen] = useState<boolean>(false)
    const [domaineEditModalIsOpen, setDomaineEditModalIsOpen] = useState<boolean>(false)

    const [domaineEditId, setDomaineEditId] = useState<number | null>(null)


    // utils

    const makeAPIRequest = useAPIRequest()
    const session = useSession().data as MySession | null

    const refreshDomaines = async () => {
        if(!session) return
        
        makeAPIRequest<Domaine[], void>(
            session,
            "get",
            "domaines",
            undefined,
            undefined,
            res => {
                setDomaines(res.data)
            }
        )
    }

    const refreshSingleDomaine = async (id: number) => {
        if(!session) return

        makeAPIRequest<Domaine, void>(
            session,
            "get",
            "domaines",
            `id/${id}`,
            undefined,
            res => {
                setDomaines(domaines.map(domaine => domaine.id === id ? res.data : domaine))
            }
        )

    }

    // render 

    return (
        <>
            <main className="flex flex-col gap-16 px-[7%] gap-y-16 pt-6">
                <div className="w-full flex flex-row gap-16 items-center">
                    <GoBackButton />
                    <div className="flex flex-col flex-1">
                        <h1 className="text-3xl font-medium text-secondary whitespace-nowrap">Domaines d'évaluation</h1>
                        <p className="text-md font-normal text-primary/60 tracking-widest whitespace-nowrap uppercase">Liste des thématiques</p>
                    </div>
                    <div className="flex flex-row gap-4">
                        <Button
                            icon={faDownload}
                            role="secondary"
                            onClick={() => {}}>
                            Exporter la liste des thématiques
                        </Button>
                        <Button
                            icon={faPlus}
                            onClick={() => setDomaineModalIsOpen(true)}>
                            Nouveau Domaine
                        </Button>
                    </div>
                </div>
                {
                    domaines.length > 0 ? 
                    <ul className="w-full flex flex-col">
                    {
                        domaines.map((domaine, index) => (
                            <DomaineCard
                                key={index}
                                domaine={domaine}
                                onEdit={() => {
                                    setDomaineEditId(domaine.id)
                                    setDomaineEditModalIsOpen(true)
                                }}
                            />
                        ))
                    }
                    </ul>
                    :
                    // show the no results image if there is no current cycle
                    <div className="h-full w-full flex flex-col items-center justify-center gap-4">
                        <div className="h-[400px] relative aspect-[1.226]">
                            <Image 
                                quality={100}
                                src={'/images/no-results-illustration.svg'} 
                                alt={"Aucun résultat."} 
                                priority
                                fill
                                style={{ 
                                    objectFit: "contain", 
                                    top: "auto"
                                }}
                            />
                        </div>
                        <p className="text-md font-normal text-primary/60">Aucun domaine d'évaluation</p>
                    </div>
                }
            </main>
            <DomaineFormModal
                isOpen={domaineModalIsOpen}
                onClose={() => setDomaineModalIsOpen(false)}
                onSubmit={d => setDomaines([...domaines, d])}
            />
            <DomaineFormModal
                domaine={domaines.find(domaine => domaine.id === domaineEditId)}
                isOpen={domaineEditModalIsOpen}
                onClose={() => setDomaineEditModalIsOpen(false)}
                onSubmit={d => {
                    setDomaines(domaines.map(domaine => domaine.id === d.id ? d : domaine))
                }}
            />

        </>
    )
}


export const getServerSideProps: GetServerSideProps<Props> = async (context) => {

    // get the session

    const session = (await getSession(context)) as MySession | null

    const emptyProps = {
        props: {
            initDomaines: []
        }
    }

    if (!session) return emptyProps   

    // get the data from the api

    const domaines = await SSRmakeAPIRequest<Domaine[], Domaine[]>({
        session,
        verb: "get",
        itemType: "domaines",
        onSuccess: res => res.data
    })


    // send the props to the page

    return {
        props: {
            initDomaines: domaines || []
        }
    }
}

export default Settings