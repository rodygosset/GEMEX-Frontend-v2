import { toISO } from "@utils/general";
import { secondsInDay } from "date-fns";
import { SearchParam } from "./api/search";

// this file contains configuration objects for the create forms
// & type definitions for those conf objects


export interface FormFieldsObj {
    [propName: string]: FieldObj;
}

export interface FieldObj {
    value: any;
    conf: FormElement;
    isInErrorState?: boolean;
}


export interface FormElement extends SearchParam {
    fullWidth?: boolean;
    required?: boolean;
};

export const textFormElement: FormElement = {
    type: "text",
    defaultValue: ""
}

export const textAreaFormElement: FormElement = {
    type: "textArea",
    defaultValue: ""
}

export const numberFormElement: FormElement = {
    type: "number",
    defaultValue: 1
}

export const timeDeltaFormElement: FormElement = {
    type:"timeDelta",
    defaultValue: secondsInDay
}

export const itemFormElement: FormElement = {
    type: "",
    minValue: 1,
    required: true
}

export const itemListFormElement: FormElement = {
    type: "itemList",
    item: "",
    defaultValue: []
}

export const dateFormElement: FormElement = { 
    type: "date",
    defaultValue: toISO(new Date())
} 

export const booleanFormElement: FormElement = { type: "boolean", defaultValue: false }


export const fileFormElement: FormElement = {
    type: "file",
    item: "fichiers",
    defaultValue: []
}

export interface CreateFormConf {
    [propName: string]: { [propName: string]: FormElement }
}


// used by the create

export const createFormConf: CreateFormConf = {
    users: {
        username: { ...textFormElement, fullWidth: true, label: "Nom d'utilisateur" },
        prenom: { ...textFormElement, label: "Prénom" },
        nom: textFormElement,
        email: { ...textFormElement, label: "Adresse e-mail" },
        role_id: { ...itemFormElement, type: "roles", label: "Rôle" },
        groups: { ...itemListFormElement, item: "groups", label: "Groupe" }
    },
    roles: {
        titre: { ...textFormElement, fullWidth: true },
        permissions: { ...textFormElement },
        suppression: { ...textFormElement }
    },
    localisations_ilots: {
        nom: { ...textFormElement, label: "Titre" }
    },
    ilots: {
        nom: { ...textFormElement, label: "Titre", required: true },
        numero: { ...textFormElement, label: "Numéro" },
        fichiers: fileFormElement,
        localisation_id: { ...itemFormElement, type: "localisations_ilots", label: "Localisation"}
    },
    regies: {
        nom: { ...textFormElement, label: "Titre", required: true }
    },
    expositions: {
        nom: { ...textFormElement, label: "Titre", required: true },
        commentaire: textAreaFormElement,
        ilot_id: { ...itemFormElement, type: "ilots", label: "Îlot" },
        regie_id: { ...itemFormElement, type: "regies", label: "Régie" },
        fichiers: fileFormElement,
        annee: { ...numberFormElement, defaultValue:  new Date().getFullYear() },
        is_active: { ...booleanFormElement, defaultValue: true, label: "En cours" }
    },
    categories_articles: {
        nom: { ...textFormElement, label: "Titre", required: true }
    },
    lieux_stockage_articles: {
        nom: { ...textFormElement, label: "Titre", required: true }
    },
    articles: {
        nom: { ...textFormElement, label: "Titre", required: true },
        fournisseur: textFormElement,
        code: textFormElement,
        categorie_id: { ...itemFormElement, type: "categories_articles", label: "Catégorie" },
        stock_id: { ...itemFormElement, type: "stocks", label: "Stock" },
        lieu_stockage_id: { ...itemFormElement, type: "lieux_stockage_articles", label: "Lieu de stockage" },
        description: textAreaFormElement,
        fichiers: fileFormElement,
        seuil_orange: { ...numberFormElement, label: "Seuil Orange" },
        seuil_rouge: { ...numberFormElement, label: "Seuil Rouge" },
        quantite: { ...numberFormElement, label: "Quantité" }
    },
    historiques_stocks: {
        article_id: { ...itemFormElement, type: "articles", label: "Article" },
        quantite: { ...numberFormElement, label: "Quantité" }
    },
    stocks: {
        nom: { ...textFormElement, label: "Titre", required: true }
    },
    categories_elements: {
        nom: { ...textFormElement, label: "Titre", required: true }
    },
    etats_elements: {
        nom: { ...textFormElement, label: "Titre", required: true }
    },
    exploitations_elements: {
        nom: { ...textFormElement, label: "Titre", required: true }
    },
    localisations_elements: {
        nom: { ...textFormElement, label: "Titre", required: true }
    },
    elements: {
        nom: { ...textFormElement, label: "Titre", required: true },
        exposition_id: { ...itemFormElement, type: "expositions", label: "Exposition" },
        numero: { ...textFormElement, label: "Numéro"},
        commentaire: textAreaFormElement,
        categories: { ...itemListFormElement, item: "categories_elements", label: "Catégories" },
        etat_id: { ...itemFormElement, type: "etats_elements", label: "État" },
        exploitation_id: { ...itemFormElement, type: "exploitations_elements", label: "Exploitation" },
        localisation_id: { ...itemFormElement, type: "localisations_elements", label: "Localisation" },
        coefficient: { ...numberFormElement, minValue: 0 },
        fichiers: fileFormElement
    },
    constituents: {
        nom: { ...textFormElement, label: "Titre", required: true },
        article_id: { ...itemFormElement, type: "articles", label: "Article" },
        element_id: { ...itemFormElement, type: "elements", label: "Élément" },
        quantite: { ...numberFormElement, label: "Quantité" }
    },
    tags: {
        nom: { ...textFormElement, label: "Titre", required: true }
    },
    types_operations: {
        nom: { ...textFormElement, label: "Titre", required: true }
    },
    natures_operations: {
        nom: { ...textFormElement, label: "Titre", required: true }
    },
    fiches: {
        nom: { ...textFormElement, label: "Titre de la fiche", required: true },
        ilot_id: { ...itemFormElement, type: "ilots", label: "Élément / Exposition", defaultValue: null, required: false },
        exposition_id: { ...itemFormElement, type: "expositions", label: "Exposition", defaultValue: null, required: false },
        element_id: { ...itemFormElement, type: "elements", label: "Élément", defaultValue: null, required: false },
        numero_di: { ...textFormElement, label: "Numéro de la DI" },
        description: textAreaFormElement,
        remarque: textAreaFormElement,
        date_debut: { ...dateFormElement, label: "Date de début" },
        date_fin: { ...dateFormElement, label: "Date de fin"},
        type_id: { ...itemFormElement, type: "types_operations", label: "Type d'opération" },
        nature_id: { ...itemFormElement, type: "natures_operations", label: "Nature de l'opération" },
        validation: booleanFormElement,
        user_en_charge_id: { ...itemFormElement, type: "users", label: "Utilisateur en charge" },
        tags: { ...itemListFormElement, item: "tags", label: "Tags" },
        fichiers: fileFormElement,
        is_active: { ...booleanFormElement, label: "Active" }
    },
    fiches_systematiques: {
        nom: { ...textFormElement, label: "Titre de la fiche", required: true },
        ilot_id: { ...itemFormElement, type: "ilots", label: "Élément / Exposition", defaultValue: null },
        exposition_id: { ...itemFormElement, type: "expositions", label: "Exposition", defaultValue: null },
        element_id: { ...itemFormElement, type: "elements", label: "Élément", defaultValue: null },
        description: textAreaFormElement,
        informations: textAreaFormElement,
        date_initiale: { ...dateFormElement},
        nature_id: { ...itemFormElement, type: "natures_operations", label: "Nature de l'opération" },
        user_en_charge_id: { ...itemFormElement, type: "users", label: "Utilisateur en charge" },
        periodicite: { ...timeDeltaFormElement, label: "Periodicité", defaultValue: 2 * secondsInDay },
        rappel: timeDeltaFormElement,
        tags: { ...itemListFormElement, item: "tags", label: "Tags" },
        fichiers: fileFormElement,
        is_active: { ...booleanFormElement, label: "Active" }
    },
    historiques_fiches_systematiques: {
        fiche_id: { ...itemFormElement, type: "fiches", label: "Fiche" },
        commentaire: textFormElement
    },
}