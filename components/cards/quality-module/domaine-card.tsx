import Button from "@components/button";
import { Domaine } from "@conf/api/data-types/quality-module";
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";


interface Props {
    domaine: Domaine;
    onEdit: () => void;
}


const DomaineCard = (
    {
        domaine,
        onEdit
    }: Props
) => {

    // render

    return (
        <li className="w-full flex flex-col bg-white/10 shadow-2xl shadow-primary/20 p-[32px] rounded-2xl">
            <div className="flex flex-row gap-4 w-full">
                <div className="flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-secondary">{domaine.nom}</h3>
                    <p className="text-md font-normal text-primary/60">{domaine.description}</p>
                </div>
                <div className="flex flex-row gap-4">
                    <Button
                        hasBorders
                        icon={faEdit}
                        role="tertiary"
                        onClick={onEdit}>
                        Modifier
                    </Button>
                    <Button
                        icon={faPlus}
                        role="secondary"
                        onClick={() => {}}>
                        Nouvelle thématique
                    </Button>
                </div>
            </div>
        </li>
    )

}

export default DomaineCard