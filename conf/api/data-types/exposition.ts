
export interface Exposition {
    id: number;
    nom: string;
    annee: number;
    regie_id: number;
    commentaire: string;
    is_active: boolean;
    fichiers: string[];
    date_creation: string;
    modifications: string;
}