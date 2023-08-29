
// Data models for the quality module
// they correspond to the data models in the backend, which we retrieve from the API

export interface Evaluation {
    id: number;
    mois_cycle_id: number;
    date_rendu_reelle: string;
    date_rendu: string;
    user_id: number;
    element_id: number;
    thematique_id: number;
    question_note?: number;
    note_a?: number;
    note_b?: number;
    note_c?: number;
    note_d?: number;
    note_e?: number;
    note?: number;
    reponses: {
        evaluation_id: number;
        question_id: number;
        note: number;
        id: number;
    }[];
    commentaire: string;
    approved: boolean;
}

export interface MoisCycle {
    id: number;
    cycle_id: number;
    mois: number;
    note?: number;
    done: boolean;
    thematiques: {
        mois_cycle_id: number;
        thematique_id: number;
        note?: number;
        id: number;
    }[];
    expositions: {
        mois_cycle_id: number;
        exposition_id: number;
        note?: number;
        id: number;
    }[];
    elements: {
        mois_cycle_id: number;
        element_id: number;
        note?: number;
        id: number;
    }[];
    evaluations: Evaluation[];
}

export interface Cycle {
    id: number;
    note?: number;
    date_debut: string;
    date_fin: string;
    mois_cycle: MoisCycle[];
    expositions: {
        cycle_id: number;
        exposition_id: number;
    }[];
}

export interface QuestionCreate {
    titre?: string;
    question: string;
    optional: boolean;
}

export interface Thematique {
    id: number;
    nom: string;
    description: string;
    periodicite: number; // in months
    ponderateur: number;
    questions: {
        titre?: string;
        question: string;
        optional: boolean;
        thematique_id: number;
        id: number;
    }[];
    question: string;
    question_ponderateur: number;
    domaine_id: number;
}

export interface Domaine {
    id: number;
    nom: string;
    description: string;
    thematiques: Thematique[];
}