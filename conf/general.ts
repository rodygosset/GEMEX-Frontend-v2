import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faBox, faFileAlt, faLandmark, faMonument } from "@fortawesome/free-solid-svg-icons";


export interface CreatableItem {
    label: string;
    value: string;
    icon: IconProp;
    permission: string;
}

export const creatableItemsList: CreatableItem[] = [
    {
        value: 'fiches',
        label: 'Fiche',
        icon: faFileAlt,
        permission: 'fiches',
    },
    {
        value: 'ilots',
        label: 'Ilôt',
        icon: faLandmark,
        permission: 'ilots',
    },
    {
        value: 'expositions',
        label: 'Exposition',
        icon: faMonument,
        permission: 'expositions',
    },
    {
        value: 'elements',
        label: 'Élément',
        icon: faBox,
        permission: 'elements',
    }
    // {
    //     value: 'article',
    //     label: 'Article',
    //     icon: faBox,
    //     permission: 'stocks',
    // }

]