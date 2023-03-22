import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCheck, faCheckDouble, faMessage, faSpinner } from "@fortawesome/free-solid-svg-icons";

import colors from "@styles/abstracts/_colors.module.scss"

export type FicheStatusId = 1 | 2 | 3 | 4;

export const REQUEST_STATUS_ID = 1
export const INIT_STATUS_ID = 2
export const DONE_STATUS_ID = 3 
export const APPROVED_STATUS_ID = 4

export interface FicheStatus {
    id: FicheStatusId;
    nom: string;
}


export interface FicheStatusConfObj {
    id: FicheStatusId;
    color: string;
    icon: IconProp;
}

export const ficheStatusConf: FicheStatusConfObj[] = [
    {
        id: 1,
        color: colors.warning,
        icon: faMessage
    },
    {
        id: 2,
        color: colors.primary,
        icon: faSpinner
    },
    {
        id: 3,
        color: colors.secondary,
        icon: faCheck
    },
    {
        id: 4,
        color: colors.success,
        icon: faCheckDouble
    }
]



export interface Fiche {
    id: number;
    nom: string;
    auteur_id: number;
    ilot_id: number;
    exposition_id: number;
    element_id: number;
    date_debut: string;
    date_fin: string;
    type_id: number;
    nature_id: number;
    description: string;
    remarque: string;
    numero_di: string;
    validation: boolean;
    user_en_charge_id: number;
    is_active: boolean;
    status_id: number;
    tags: string[];
    fichiers: string[];
    date_creation: string;
    modifications: string;
}

export interface FicheSystematique {
    id: number;
    nom: string;
    auteur_id: number;
    ilot_id: number;
    exposition_id: number;
    element_id: number;
    nature_id: number;
    description: string;
    informations: string;
    user_en_charge_id: number;
    rappel: number;
    periodicite: number;
    date_initiale: string;
    date_rappel: string;
    date_prochaine: string;
    is_active: boolean;
    tags: string[];
    fichiers: string[];
    date_creation: string;
    modifications: string;
}

export interface HistoriqueFicheSystematique {
    id: number;
    fiche_id: number;
    user_id: number;
    commentaire: string;
    date: string;
    modifications: string;
}

export interface HistoriqueFicheSystematiqueCreate {
    fiche_id: number;
    commentaire: string;
    date: string;
}


// configuration

export const ficheTypes = [
    "opération",
    "relance",
    "panne",
    "systématique"
]


export interface FicheTypeConf {
    hiddenFields: string[];
    excludedFields: string[];
    defaultValues: { [propName: string]: string | string[] | number | boolean }
}

export interface FichesConf {
    [propName: string]: FicheTypeConf
}

// the following objects are used to determine 
// how the user can interact with different types of Fiche objects
// (hidden fields, default values for forms, excluded fields...)

export const fichesCreateConf: FichesConf = {
    "opération": {
        hiddenFields: [
            "tags",
            "is_active",
            "validation"
        ],
        excludedFields: [ "is_active" ],
        defaultValues: {
            tags: [
                "Opération"
            ],
            validation: true
        }
    },
    "relance": {
        hiddenFields: [
            "date_fin",
            "remarque",
            "numero_di",
            "type_id",
            "is_active",
            "tags",
            "validation"
        ],
        excludedFields: [
            "is_active"
        ],
        defaultValues: {
            tags: [
                "Relance"
            ],
            type_id: 4, // correctif
            validation: false
        }
    },
    "panne": {
        hiddenFields: [
            "date_fin",
            "is_active",
            "tags",
            "validation"
        ],
        excludedFields: [
            "is_active"
        ],
        defaultValues: {
            tags: [
                "Panne"
            ],
            validation: true
        }
    },
    "systématique": {
        hiddenFields: [
            "user_en_charge_id",
            "is_active",
            "tags"
        ],
        excludedFields: [
            "is_active"
        ],
        defaultValues: {
            tags: [
                "Systématique"
            ]
        }
    }
}

// type definitions for configuration objects

export interface FicheTypeViewConf {
    excludedFields: string[];
}

export interface FichesEditConf {
    [propName: string]: FicheTypeViewConf
}

// conf differs between the create & edit forms

export const fichesEditConf: FichesEditConf = {
    "opération": {
        excludedFields: [
            "tags"
        ]
    },
    "relance": {
        excludedFields: [
            "date_fin",
            "remarque",
            "numero_di",
            "type_id",
            "tags"
        ]
    },
    "panne": {
        excludedFields: [
            "tags"
        ]
    },
    "systématique": {
        excludedFields: [
            "date_initiale",
            "tags"
        ]
    }
}

// for the view page

export const fichesViewConf: FichesEditConf = {
    "opération": {
        excludedFields: [
            "validation"
        ]
    },
    "relance": {
        excludedFields: [
            "date_fin",
            "remarque",
            "numero_di",
            "type_id",
            "validation"
        ]
    },
    "panne": {
        excludedFields: [
            "validation"
        ]
    },
    "systématique": {
        excludedFields: [
        ]
    }
}