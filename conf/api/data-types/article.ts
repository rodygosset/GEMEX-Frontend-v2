
export interface Article {
    id: number;
    nom: string;
    code: string;
    categorie_id: number;
    lieu_stockage_id: number;
    stock_id: number;
    quantite: number;
    description: string;
    fournisseur: string;
    seuil_orange: number;
    seuil_rouge: number;
    fichiers: string[];
    date_creation: string;
    modifications: string;
}