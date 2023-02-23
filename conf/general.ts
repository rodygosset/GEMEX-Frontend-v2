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


export const itemNames = {
    users: "Utilisateurs",
    roles: "Rôles",
    groups: "Groupes",
    fichiers: "Fichers",
    localisations_ilots: "Localisations Îlots",
    ilots: "Îlots",
    notifications: "Notifications",
    regies: "Régies",
    expositions: "Expositions",
    categories_articles: "Catégories Articles",
    lieux_stockage_articles: "Lieux Stockage Articles",
    articles: "Articles",
    historiques_stocks: "Historiques stocks",
    stocks: "Stocks",
    categories_elements: "Catégories Éléments",
    etats_elements: "Etats Éléments",
    exploitations_elements: "Exploitations Éléments",
    localisations_elements: "Localisations Éléments",
    elements: "Éléments",
    constituents: "Constituents",
    tags: "Tags",
    types_operations: "Types d'Opération",
    natures_operations: "Natures d'Opération",
    fiches_status: "Status",
    fiches: "Fiches",
    fiches_systematiques: "Fiches systématiques",
    historiques_fiches_systematiques: "Historiques fiches systématiques"
}