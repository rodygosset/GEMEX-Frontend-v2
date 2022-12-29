
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
