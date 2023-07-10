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
    date_debut: Date;
    date_fin: Date;
    taux: number;
    id: number;
}

export interface ExpoRapport {
    exposition_id: number;
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
    date_debut: Date;
    date_fin: Date;
    taux: number;
    taux_semaine: TauxSemaine[];
    groupes_expositions: ExpoGroup[];
    id: number;
}