import { SearchParam } from "./api/search";

// this file contains configuration objects for the create forms
// & type definitions for those conf objects


export interface FormFieldsObj {
    [propName: string]: FieldObj;
}

export interface FieldObj {
    value: any;
    conf: FormElement;
}


export interface FormElement extends SearchParam {
    fullWidth?: boolean;
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
    type:"timeDelta"
}

export const itemFormElement: FormElement = {
    type: "",
    defaultValue: 1,
    minValue: 1
}

export const itemListFormElement: FormElement = {
    type: "itemList",
    item: ""
}

export const dateFormElement: FormElement = { type: "date" } 

export const booleanFormElement: FormElement = { type: "boolean", defaultValue: false }


export const fileFormElement: FormElement = {
    type: "file",
    item: "fichiers"
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
        nom: { ...textFormElement, label: "Titre" },
        numero: { ...textFormElement, label: "Numéro"},
        fichiers: fileFormElement,
        localisation_id: { ...itemFormElement, type: "localisations_ilots", label: "Localisation" }
    },
    regies: {
        nom: { ...textFormElement, label: "Titre" }
    },
    expositions: {
        nom: { ...textFormElement, label: "Titre" },
        commentaire: textAreaFormElement,
        ilot_id: { ...itemFormElement, type: "ilots", label: "Îlot" },
        regie_id: { ...itemFormElement, type: "regies", label: "Régie" },
        fichiers: fileFormElement,
        annee: { ...numberFormElement, defaultValue:  new Date().getFullYear() },
        is_active: { ...booleanFormElement, defaultValue: true, label: "En cours" }
    },
    categories_articles: {
        nom: { ...textFormElement, label: "Titre" }
    },
    lieux_stockage_articles: {
        nom: { ...textFormElement, label: "Titre" }
    },
    articles: {
        nom: { ...textFormElement, label: "Titre" },
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
        nom: { ...textFormElement, label: "Titre" }
    },
    categories_elements: {
        nom: { ...textFormElement, label: "Titre" }
    },
    etats_elements: {
        nom: { ...textFormElement, label: "Titre" }
    },
    exploitations_elements: {
        nom: { ...textFormElement, label: "Titre" }
    },
    localisations_elements: {
        nom: { ...textFormElement, label: "Titre" }
    },
    elements: {
        nom: { ...textFormElement, label: "Titre" },
        numero: { ...textFormElement, label: "Numéro"},
        commentaire: textAreaFormElement,
        exposition_id: { ...itemFormElement, type: "expositions", label: "Exposition" },
        etat_id: { ...itemFormElement, type: "etats_elements", label: "État" },
        exploitation_id: { ...itemFormElement, type: "exploitations_elements", label: "Exploitation" },
        localisation_id: { ...itemFormElement, type: "localisations_elements", label: "Localisation" },
        categories: { ...itemListFormElement, item: "categories_elements", label: "Catégories" },
        coefficient: { ...numberFormElement, minValue: 0 },
        fichiers: fileFormElement
    },
    constituents: {
        nom: { ...textFormElement, label: "Titre" },
        article_id: { ...itemFormElement, type: "articles", label: "Article" },
        element_id: { ...itemFormElement, type: "elements", label: "Élément" },
        quantite: { ...numberFormElement, label: "Quantité" }
    },
    tags: {
        nom: { ...textFormElement, label: "Titre" }
    },
    types_operations: {
        nom: { ...textFormElement, label: "Titre" }
    },
    natures_operations: {
        nom: { ...textFormElement, label: "Titre" }
    },
    fiches: {
        nom: { ...textFormElement, label: "Titre de la fiche" },
        date_debut: { ...dateFormElement, label: "Date de début", defaultValue: new Date() },
        date_fin: { ...dateFormElement, label: "Date de fin"},
        ilot_id: { ...itemFormElement, type: "ilots", label: "Îlot", defaultValue: null },
        exposition_id: { ...itemFormElement, type: "expositions", label: "Exposition", defaultValue: null },
        element_id: { ...itemFormElement, type: "elements", label: "Élément", defaultValue: null },
        numero_di: { ...textFormElement, label: "Numéro de la DI" },
        description: textAreaFormElement,
        remarque: textAreaFormElement,
        validation: booleanFormElement,
        type_id: { ...itemFormElement, type: "types_operations", label: "Type d'opération" },
        nature_id: { ...itemFormElement, type: "natures_operations", label: "Nature de l'opération" },
        user_en_charge_id: { ...itemFormElement, type: "users", label: "Utilisateur en charge" },
        tags: { ...itemListFormElement, item: "tags" },
        fichiers: fileFormElement,
        is_active: { ...booleanFormElement, label: "Active" }
    },
    fiches_systematiques: {
        nom: { ...textFormElement, label: "Titre de la fiche", fullWidth: true },
        date_initiale: { ...dateFormElement, defaultValue: new Date() },
        ilot_id: { ...itemFormElement, type: "ilots", label: "Îlot", defaultValue: null },
        exposition_id: { ...itemFormElement, type: "expositions", label: "Exposition", defaultValue: null },
        element_id: { ...itemFormElement, type: "elements", label: "Élément", defaultValue: null },
        description: textAreaFormElement,
        informations: textAreaFormElement,
        nature_id: { ...itemFormElement, type: "natures_operations", label: "Nature de l'opération" },
        user_en_charge_id: { ...itemFormElement, type: "users", label: "Utilisateur en charge" },
        periodicite: { ...timeDeltaFormElement, label: "Periodicité" },
        rappel: timeDeltaFormElement,
        tags: { ...itemListFormElement, item: "tags" },
        fichiers: fileFormElement,
        is_active: { ...booleanFormElement, label: "Active" }
    },
    historiques_fiches_systematiques: {
        fiche_id: { ...itemFormElement, type: "fiches", label: "Fiche" },
        commentaire: textFormElement
    },
}