import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faBarsProgress, faCalendar, faClipboard, faComment, faEnvelope, faFile, faHashtag, faHourglass, faLink, faList, faMonument, faRepeat, faTag } from "@fortawesome/free-solid-svg-icons";
import { SearchParam } from "./api/search";


export interface Attribute extends SearchParam {
    fullWidth?: boolean;
    icon: IconProp;
};

export interface LinkAttribute extends Attribute {
    searchParam: string;
}

export const textAttribute: Attribute = {
    icon: faComment,
    type: "text",
    defaultValue: ""
}

export const textAreaAttribute: Attribute = {
    icon: faClipboard,
    type: "textArea",
    defaultValue: ""
}

export const numberAttribute: Attribute = {
    icon: faHashtag,
    type: "number",
    defaultValue: 1
}

export const timeDeltaAttribute: Attribute = {
    icon: faHourglass,
    type:"timeDelta"
}

export const itemAttribute: Attribute = {
    icon: faLink,
    type: "",
    defaultValue: 1,
    minValue: 1
}

export const ficheStatusAttribute: Attribute = {
    icon: faBarsProgress,
    type: "fiches_status",
    label: "Status"
}

export const itemListAttribute: Attribute = {
    icon: faList,
    type: "itemList",
    item: ""
}

export const linkAttribute: LinkAttribute = {
    icon: faLink,
    type: "link",
    searchParam: ""
}

export const dateAttribute: Attribute = { icon: faCalendar, type: "date" } 

export const booleanAttribute: Attribute = { icon: faRepeat, type: "boolean", defaultValue: false }


export const fileAttribute: Attribute = {
    icon: faFile,
    type: "file"
}

export interface ViewConf {
    [propName: string]: { [propName: string]: Attribute | LinkAttribute }
}


export const viewConf: ViewConf = {
    users: {
        username: { ...textAttribute, fullWidth: true, label: "Nom d'utilisateur" },
        prenom: { ...textAttribute, label: "Prénom" },
        nom: textAttribute,
        role_id: { ...itemAttribute, type: "roles", label: "Rôle" },
        groups: { ...itemListAttribute, item: "groups", label: "Groupe" },
        is_active: { ...booleanAttribute, defaultValue: true, label: "Actif" }
    },
    roles: {
        titre: { ...textAttribute, fullWidth: true },
        permissions: { ...textAttribute },
        suppression: { ...textAttribute },
        users: { ...linkAttribute, searchParam: "role_id" }
    },
    fichiers: {
        file: { ...fileAttribute, label: "Fichier" }
    },
    localisations_ilots: {
        nom: textAttribute,
        ilots: { ...linkAttribute, searchParam: "localisation_id" }
    },
    ilots: {
        nom: textAttribute,
        numero: { ...textAttribute, label: "Numéro"},
        localisation_id: { ...itemAttribute, type: "localisations_ilots", label: "Localisation" },
        fichiers: fileAttribute,
        date_creation: { ...dateAttribute, label: "Date de création"},
        expositions: { ...linkAttribute, searchParam: "ilot_id" }
    },
    regies: {
        nom: textAttribute,
        expositions: { ...linkAttribute, searchParam: "regie_id" }
    },
    expositions: {
        nom: { ...textAttribute, fullWidth: true },
        is_active: { ...booleanAttribute, defaultValue: true, label: "En cours" },
        annee: { ...numberAttribute, defaultValue:  new Date().getFullYear(), label: "Année" },
        ilot_id: { ...itemAttribute, type: "ilots", label: "Îlot" },
        regie_id: { ...itemAttribute, type: "regies", label: "Régie" },
        commentaire: textAreaAttribute,
        fichiers: fileAttribute,
        date_creation: { ...dateAttribute, label: "Date de création" },
        elements: { ...linkAttribute, searchParam: "exposition_id" }
    },
    categories_articles: {
        nom: textAttribute,
        articles: { ...linkAttribute, searchParam: "categorie_id" }
    },
    lieux_stockage_articles: {
        nom: textAttribute,
        articles: { ...linkAttribute, searchParam: "lieu_stockage_id" }
    },
    articles: {
        nom: textAttribute,
        fournisseur: textAttribute,
        code: textAttribute,
        stock_id: { ...itemAttribute, type: "stocks", label: "Stock" },
        quantite: { ...numberAttribute, label: "Quantité" },
        seuil_orange: { ...numberAttribute, label: "Seuil Orange" },
        seuil_rouge: { ...numberAttribute, label: "Seuil Rouge" },
        categorie_id: { ...itemAttribute, type: "categories_articles", label: "Catégorie" },
        lieu_stockage_id: { ...itemAttribute, type: "lieux_stockage_articles", label: "Lieu de stockage" },
        description: textAreaAttribute,
        fichiers: fileAttribute,
        date_creation: { ...dateAttribute, label: "Date de création" },
        constituents: { ...linkAttribute, searchParam: "article_id" }
    },
    historiques_stocks: {
        article_id: { ...itemAttribute, type: "articles", label: "Article" },
        user_id: { ...itemAttribute, type: "users", label: "Utilisateur à l'origine" },
        quantite: { ...numberAttribute, label: "Quantité" },
        constituent: { ...itemAttribute, type: "constituent", label: "Constituent" },
        date: { ...dateAttribute, label: "Date" }
    },
    stocks: {
        nom: { ...textAttribute, fullWidth: true },
        historique: { ...itemListAttribute, item: "historiques_stocks", fullWidth: true },
        articles: { ...itemListAttribute, item: "articles", fullWidth: true },
        date_creation: { ...dateAttribute, label: "Date de création" }
    },
    categories_elements: {
        nom: textAttribute,
        elements: { ...linkAttribute, searchParam: "categories" }
    },
    etats_elements: {
        nom: textAttribute,
        elements: { ...linkAttribute, searchParam: "etat_id" }
    },
    exploitations_elements: {
        nom: textAttribute,
        elements: { ...linkAttribute, searchParam: "exploitation_id" }
    },
    localisations_elements: {
        nom: textAttribute,
        elements: { ...linkAttribute, searchParam: "localisation_id" }
    },
    elements: {
        nom: textAttribute,
        exposition_id: { ...itemAttribute, type: "expositions", label: "Exposition", icon: faMonument },
        date_creation: { ...dateAttribute, label: "Créé le" },
        commentaire: textAreaAttribute,
        categories: { ...itemListAttribute, item: "categories_elements", label: "Catégories", icon: faTag },
        numero: { ...textAttribute, label: "Numéro"},
        etat_id: { ...itemAttribute, type: "etats_elements", label: "État" },
        exploitation_id: { ...itemAttribute, type: "exploitations_elements", label: "Exploitation" },
        localisation_id: { ...itemAttribute, type: "localisations_elements", label: "Localisation" },
        coefficient: { ...numberAttribute, minValue: 0 },
        constituents: { ...linkAttribute, searchParam: "element_id" },
        fichiers: fileAttribute,
    },
    constituents: {
        nom: { ...textAttribute, fullWidth: true },
        article_id: { ...itemAttribute, type: "articles", label: "Article" },
        element_id: { ...itemAttribute, type: "elements", label: "Élément" },
        quantite: { ...numberAttribute, label: "Quantité" },
        date_creation: { ...dateAttribute, label: "Date de création" }
    },
    tags: {
        nom: textAttribute,
        fiches: { ...linkAttribute, searchParam: "tags" },
        fiches_systematiques: { ...linkAttribute, searchParam: "tags" }
    },
    types_operations: {
        nom: textAttribute,
        fiches: { ...linkAttribute, searchParam: "type_id" }
    },
    natures_operations: {
        nom: textAttribute,
        fiches: { ...linkAttribute, searchParam: "nature_id" },
        fiches_systematiques: { ...linkAttribute, searchParam: "nature_id" }
    },
    fiches_status: {
        nom: textAttribute
    },
    fiches: {
        nom: { ...textAttribute, fullWidth: true },
        auteur_id: { ...itemAttribute, type: "users", label: "Auteur de la fiche" },
        user_en_charge_id: { ...itemAttribute, type: "users", label: "Utilisateur en charge" },
        numero_di: { ...textAttribute, label: "Numéro de la DI" },
        ilot_id: { ...itemAttribute, type: "ilots", label: "Îlot" },
        exposition_id: { ...itemAttribute, type: "expositions", label: "Exposition" },
        element_id: { ...itemAttribute, type: "elements", label: "Élément" },
        date_debut: { ...dateAttribute, label: "Date de début" },
        date_fin: { ...dateAttribute, label: "Date de fin"},
        description: textAreaAttribute,
        remarque: textAreaAttribute,
        validation: booleanAttribute,
        type_id: { ...itemAttribute, type: "types_operations", label: "Type d'opération" },
        nature_id: { ...itemAttribute, type: "natures_operations", label: "Nature de l'opération" },
        tags: { ...itemListAttribute, item: "tags" },
        fichiers: fileAttribute,
        date_creation: { ...dateAttribute, label: "Date de création" },
        is_active: { ...booleanAttribute, defaultValue: true, label: "Active" },
        status_id: ficheStatusAttribute
    },
    fiches_systematiques: {
        nom: { ...textAttribute, fullWidth: true },
        auteur_id: { ...itemAttribute, type: "users", label: "Auteur de la fiche" },
        user_en_charge_id: { ...itemAttribute, type: "users", label: "Utilisateur en charge" },
        ilot_id: { ...itemAttribute, type: "ilots", label: "Îlot" },
        exposition_id: { ...itemAttribute, type: "expositions", label: "Exposition" },
        element_id: { ...itemAttribute, type: "elements", label: "Élément" },
        nature_id: { ...itemAttribute, type: "natures_operations", label: "Nature de l'opération" },
        periodicite: { ...timeDeltaAttribute, label: "Periodicité" },
        rappel: timeDeltaAttribute,
        date_initiale: dateAttribute,
        date_rappel: dateAttribute,
        date_prochaine: dateAttribute,
        description: textAreaAttribute,
        informations: textAreaAttribute,
        tags: { ...itemListAttribute, item: "tags" },
        fichiers: fileAttribute,
        date_creation: { ...dateAttribute, label: "Date de création" },
        is_active: { ...booleanAttribute, defaultValue: true, label: "Active" }
    },
    historiques_fiches_systematiques: {
        fiche_id: { ...itemAttribute, type: "fiches", label: "Fiche" },
        user_id: { ...itemAttribute, type: "users", label: "Utilisateur à l'origine" },
        commentaire: textAttribute,
        date: dateAttribute
    },
}