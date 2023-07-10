export interface ExpoGroupCreate {
    nom: string;
    expositions: { nom: string, id: number }[];
}

export interface ExpoGroupPost {
    nom: string;
    expositions: { exposition_id: number }[];
}


export interface RapportCreate {
    date_debut: string;
    date_fin: string;
    groupes_expositions: ExpoGroupPost[];
}


export interface TauxSemaine {
    date_debut: string;
    date_fin: string;
    taux: string;
    id: number;
}

export interface ExpoRapport {
    exposition_id: number;
    nom: string;
    groupe_id: number;
    taux: number;
    taux_semaine: TauxSemaine[];
    id: number;
}

export interface ExpoGroup {
    nom: string;
    rapport_id: number;
    taux: number;
    taux_semaine: TauxSemaine[];
    expositions: ExpoRapport[];
    id: number;
}

export interface RapportTauxDisponibilite {
    date_debut: string;
    date_fin: string;
    taux: number;
    taux_semaine: TauxSemaine[];
    groupes_expositions: ExpoGroup[];
    id: number;
}