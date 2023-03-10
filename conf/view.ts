import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faBox, faBoxOpen, faCalendar, faClipboard, faComment, faFile, faFlag, faHashtag, faHeadset, faHourglass, faHourglassHalf, faLandmark, faLink, faList, faLocationDot, faMonument, faPersonDigging, faPowerOff, faPuzzlePiece, faRepeat, faTag, faTimeline, faTruck, faUser } from "@fortawesome/free-solid-svg-icons";
import { SearchParam } from "./api/search";


export const viewableItemTypes = [
    "ilots",
    "expositions",
    "stocks",
    "articles",
    "constituents",
    "elements",
    "fiches",
    "fiches_systematiques"
]

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
    icon: faHourglassHalf,
    type:"timeDelta"
}

export const itemAttribute: Attribute = {
    icon: faLink,
    type: "",
    defaultValue: 1,
    minValue: 1
}

export const ficheStatusAttribute: Attribute = {
    icon: faFlag,
    type: "fiches_status",
    label: "Status"
}

export const itemListAttribute: Attribute = {
    icon: faTag,
    type: "itemList",
    item: ""
}

export const linkAttribute: LinkAttribute = {
    icon: faLink,
    type: "link",
    searchParam: ""
}

export const dateAttribute: Attribute = { icon: faCalendar, type: "date" } 

export const booleanAttribute: Attribute = { icon: faPowerOff, type: "boolean", defaultValue: false }


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
        prenom: { ...textAttribute, label: "Pr??nom" },
        nom: textAttribute,
        role_id: { ...itemAttribute, type: "roles", label: "R??le" },
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
        numero: { ...textAttribute, label: "Num??ro"},
        fichiers: fileAttribute,
        expositions: { ...linkAttribute, icon: faMonument, label: "Expositions", searchParam: "ilot_id" },
        localisation_id: { ...itemAttribute, type: "localisations_ilots", icon: faLocationDot, label: "Localisation" },
        date_creation: { ...dateAttribute, label: "Date de cr??ation"},
    },
    regies: {
        nom: textAttribute,
        expositions: { ...linkAttribute, searchParam: "regie_id" }
    },
    expositions: {
        nom: { ...textAttribute, fullWidth: true },
        annee: { ...numberAttribute, defaultValue:  new Date().getFullYear(), label: "Ann??e" },
        commentaire: textAreaAttribute,
        date_creation: { ...dateAttribute, label: "Cr????e le" },
        ilot_id: { ...itemAttribute, type: "ilots", icon: faLandmark, label: "??lot" },
        regie_id: { ...itemAttribute, type: "regies", icon: faHeadset, label: "R??gie" },
        fichiers: fileAttribute,
        elements: { ...linkAttribute, searchParam: "exposition_id", icon: faBox, label: "??l??ments" },
        is_active: { ...booleanAttribute, defaultValue: true, label: "En cours" },
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
        code: { ...textAttribute, icon: faHashtag },
        description: textAreaAttribute,
        quantite: { ...numberAttribute, label: "Quantit??" },
        seuil_orange: { ...numberAttribute, label: "Seuil Orange" },
        seuil_rouge: { ...numberAttribute, label: "Seuil Rouge" },
        fournisseur: { ...textAttribute, icon: faTruck },
        stock_id: { ...itemAttribute, type: "stocks", icon: faBox, label: "Stock" },
        categorie_id: { ...itemAttribute, type: "categories_articles", icon: faTag, label: "Cat??gorie" },
        lieu_stockage_id: { ...itemAttribute, type: "lieux_stockage_articles", icon: faLocationDot, label: "Lieu de stockage" },
        fichiers: fileAttribute,
        date_creation: { ...dateAttribute, label: "Date de cr??ation" },
        constituents: { ...linkAttribute, icon: faPuzzlePiece, label: "Constituents", searchParam: "article_id" }
    },
    historiques_stocks: {
        article_id: { ...itemAttribute, type: "articles", label: "Article" },
        user_id: { ...itemAttribute, type: "users", label: "Utilisateur ?? l'origine" },
        quantite: { ...numberAttribute, label: "Quantit??" },
        constituent: { ...itemAttribute, type: "constituent", label: "Constituent" },
        date: { ...dateAttribute, label: "Date" }
    },
    stocks: {
        nom: { ...textAttribute, fullWidth: true },
        articles: { ...linkAttribute, icon: faBoxOpen, searchParam: "stock_id", label: "Articles" },
        date_creation: { ...dateAttribute, label: "Date de cr??ation" }
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
        date_creation: { ...dateAttribute, label: "Cr???? le" },
        commentaire: textAreaAttribute,
        categories: { ...itemListAttribute, item: "categories_elements", label: "Cat??gories", icon: faTag },
        numero: { ...textAttribute, label: "Num??ro", icon: faHashtag },
        etat_id: { ...itemAttribute, type: "etats_elements", label: "??tat" },
        exploitation_id: { ...itemAttribute, type: "exploitations_elements", label: "Exploitation" },
        localisation_id: { ...itemAttribute, type: "localisations_elements", label: "Localisation" },
        coefficient: { ...numberAttribute, minValue: 0 },
        constituents: { ...linkAttribute, label: "Constituents", searchParam: "element_id" },
        fichiers: fileAttribute,
    },
    constituents: {
        nom: { ...textAttribute, fullWidth: true },
        article_id: { ...itemAttribute, type: "articles", icon: faBoxOpen, label: "Article" },
        element_id: { ...itemAttribute, type: "elements", icon: faBox, label: "??l??ment" },
        quantite: { ...numberAttribute, label: "Quantit??" },
        date_creation: { ...dateAttribute, label: "Date de cr??ation" }
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
        ilot_id: { ...itemAttribute, type: "ilots", icon: faLandmark,label: "??lot" },
        exposition_id: { ...itemAttribute, type: "expositions", icon: faMonument, label: "Exposition" },
        element_id: { ...itemAttribute, type: "elements", icon: faBox, label: "??l??ment" },
        auteur_id: { ...itemAttribute, type: "users", icon: faUser, label: "Auteur de la fiche" },
        user_en_charge_id: { ...itemAttribute, type: "users", icon: faUser,  label: "Utilisateur en charge" },
        description: textAreaAttribute,
        remarque: textAreaAttribute,
        tags: { ...itemListAttribute, item: "tags", icon: faTag, label: "Tags" },
        numero_di: { ...textAttribute, icon: faHashtag, label: "Num??ro de la DI" },
        type_id: { ...itemAttribute, type: "types_operations", icon: faPersonDigging, label: "Type d'op??ration" },
        nature_id: { ...itemAttribute, type: "natures_operations", icon: faPersonDigging, label: "Nature de l'op??ration" },
        date_debut: { ...dateAttribute, label: "Date de d??but" },
        date_fin: { ...dateAttribute, label: "Date de fin"},
        date_creation: { ...dateAttribute, label: "Date de cr??ation" },
        validation: booleanAttribute,
        fichiers: fileAttribute,
        status_id: ficheStatusAttribute,
        is_active: { ...booleanAttribute, defaultValue: true, label: "Active" }
    },
    fiches_systematiques: {
        nom: { ...textAttribute, fullWidth: true },
        ilot_id: { ...itemAttribute, type: "ilots", label: "??lot" },
        exposition_id: { ...itemAttribute, type: "expositions", label: "Exposition" },
        element_id: { ...itemAttribute, type: "elements", label: "??l??ment" },
        auteur_id: { ...itemAttribute, type: "users", icon: faUser, label: "Auteur de la fiche" },
        user_en_charge_id: { ...itemAttribute, type: "users", icon: faUser, label: "Utilisateur en charge" },
        description: textAreaAttribute,
        informations: textAreaAttribute,
        tags: { ...itemListAttribute, item: "tags", label: "Tags" },
        nature_id: { ...itemAttribute, type: "natures_operations", icon: faPersonDigging, label: "Nature de l'op??ration" },
        periodicite: { ...timeDeltaAttribute, label: "Periodicit??" },
        rappel: timeDeltaAttribute,
        date_initiale: { ...dateAttribute, label: "Date initiale" },
        date_rappel: { ...dateAttribute, label: "Date de rappel" },
        date_prochaine: { ...dateAttribute, label: "Date prochaine" },
        date_creation: { ...dateAttribute, label: "Date de cr??ation" },
        fichiers: fileAttribute,
        is_active: { ...booleanAttribute, defaultValue: true, label: "Active" }
    },
    historiques_fiches_systematiques: {
        fiche_id: { ...itemAttribute, type: "fiches", label: "Fiche" },
        user_id: { ...itemAttribute, type: "users", label: "Utilisateur ?? l'origine" },
        commentaire: textAttribute,
        date: dateAttribute
    },
}