

export interface Element {
    id: number;
    nom: string;
    commentaire: string;
    coefficient: number;
    exposition_id: number;
    etat_id: number;
    localisation_id: number;
    categories: string[];
    fichiers: string[];
    date_creation: string;
    modifications: string;
}