
export const REQUEST_STATUS_ID: number = 1
export const INIT_STATUS_ID: number = 2
export const DONE_STATUS_ID: number = 3 
export const APPROVED_STATUS_ID: number = 4

export interface FicheStatus {
    id: number;
    nom: string;
}


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
    validation: boolean;
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
        validation: true,
        hiddenFields: [
            "tags",
            "is_active"
        ],
        excludedFields: [ "is_active" ],
        defaultValues: {
            tags: [
                "Opération"
            ]
        }
    },
    "relance": {
        validation: false,
        hiddenFields: [
            "date_fin",
            "remarque",
            "numero_di",
            "type_id",
            "is_active",
            "tags"
        ],
        excludedFields: [
            "is_active"
        ],
        defaultValues: {
            tags: [
                "Relance"
            ],
            type_id: 4 // correctif
        }
    },
    "panne": {
        validation: true,
        hiddenFields: [
            "date_fin",
            "is_active",
            "tags"
        ],
        excludedFields: [
            "is_active"
        ],
        defaultValues: {
            tags: [
                "Panne"
            ]
        }
    },
    "systématique": {
        validation: false,
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