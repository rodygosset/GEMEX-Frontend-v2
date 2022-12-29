

export const defaultSearchItem = "fiches"

// type & const definitions for the search filters component


export interface SearchParam {
    type: string;
    item?: string;
    label?: string;
    defaultValue?: any;
    minValue?: any;
}

export const textSearchParam: SearchParam = {
    type: "text",
    defaultValue: ""
}

export const numberSearchParam: SearchParam = {
    type: "number",
    defaultValue: 1
}

export const numberOperatorSearchParam: SearchParam = { 
    type: "numberOperator"
}

export const timeDeltaSearchParam: SearchParam = {
    type:"timeDelta"
}

export const itemSearchParam: SearchParam = {
    type: "",
    defaultValue: 1,
    minValue: 1
}

export const itemListSearchParam: SearchParam = {
    type: "itemList",
    item: ""
}

export const dateSearchParam: SearchParam = { type: "date" }

export const booleanSearchParam: SearchParam = { type: "boolean", defaultValue: false }

// search configuration object type for a single type of data

export interface ItemSearchConf {
    url: string;
    defaultSearchParam: string;
    searchParams: { [propName: string]: SearchParam };
    searchResultFields: string[];
}

// our entire search conf object

export interface SearchConf {
    [propName: string]: ItemSearchConf
}

export const searchConf: SearchConf = {
    users: {
        url: "/api/users/search/",
        defaultSearchParam: "username",
        searchParams: {
            username: { ...textSearchParam, label: "Nom d'utilisateur" },
            prenom: { ...textSearchParam, label: "Prénom" },
            nom: textSearchParam,
            email: { ...textSearchParam, label: "Adresse e-mail" },
            role_id: { ...itemSearchParam, type: "roles", label: "Rôle" },
            groups: { ...itemListSearchParam, item: "groups", label: "Groupes" }
        },
        searchResultFields: [
            "prenom", 
            "nom", 
            "email"
        ]
    },
    fichiers: {
        url: "/api/fichiers/search/",
        defaultSearchParam: "nom",
        searchParams: {
            nom: textSearchParam,
            user_id: { ...itemSearchParam, type: "users", label: "Auteur du fichier" },
            ilot_id: { ...itemSearchParam, type: "ilots", label: "Îlot" },
            exposition_id: { ...itemSearchParam, type: "expositions" },
            article_id: { ...itemSearchParam, type: "articles" },
            element_id: { ...itemSearchParam, type: "elements", label: "Élément" }
        },
        searchResultFields: []
    },
    ilots: {
        url: "/api/ilots/search/",
        defaultSearchParam: "nom",
        searchParams: {
            numero: { ...textSearchParam, label: "Numéro"},
            nom: textSearchParam,
            localisation_id: { ...itemSearchParam, type: "localisations_ilots", label: "Localisation" },
            date_creation: { ...dateSearchParam, label: "Date de création" }
        },
        searchResultFields: [
            "numero",
            "localisation_id"
        ]
    },
    expositions: {
        url: "/api/expositions/search/",
        defaultSearchParam: "nom",
        searchParams: {
            nom: textSearchParam,
            ilot_id: { ...itemSearchParam, type: "ilots", label: "Îlot" },
            regie_id: { ...itemSearchParam, type: "regies", label: "Régie" },
            annee: { ...numberSearchParam, defaultValue:  new Date().getFullYear(), label: "Année" },
            date_creation: { ...dateSearchParam, label: "Date de création" },
            commentaire: textSearchParam,
            is_active: { ...booleanSearchParam, defaultValue: true, label: "Active" }
        },
        searchResultFields: [
            "regie_id",
            "annee"
        ]
    },
    articles: {
        url: "/api/stocks/articles/search/",
        defaultSearchParam: "nom",
        searchParams: {
            nom: textSearchParam,
            code: textSearchParam,
            categorie_id: { ...itemSearchParam, type: "categories_articles", label: "Catégorie" },
            lieu_stockage_id: { ...itemSearchParam, type: "lieux_stockage_articles", label: "Lieu de stockage" },
            stock_id: { ...itemSearchParam, type: "stocks" },
            quantite: { ...numberSearchParam, label: "Quantité" },
            quantite_operator: numberOperatorSearchParam,
            description: textSearchParam,
            fournisseur: textSearchParam,
            date_creation: { ...dateSearchParam, label: "Date de création" }
        },
        searchResultFields: [
            "categorie_id",
            "quantite"
        ]
    },
    historiques_stocks: {
        url: "/api/stocks/historique/search/",
        defaultSearchParam: "article_id",
        searchParams: {
            article_id: { ...itemSearchParam, type: "articles" },
            user_id: { ...itemSearchParam, type: "users", label: "Utilisateur" },
            stock_id: { ...itemSearchParam, type: "stocks" },
            constituent_id: { ...itemSearchParam, type: "constituents" },
            quantite: { ...numberSearchParam, label: "Quantité" },
            quantite_operator: numberOperatorSearchParam,
            date_creation: { ...dateSearchParam, label: "Date de création" }
        },
        searchResultFields: [
            "article_id",
            "quantite"
        ]
    },
    stocks: {
        url: "/api/stocks/search/",
        defaultSearchParam: "nom",
        searchParams: {
            nom: textSearchParam,
            date_creation: { ...dateSearchParam, label: "Date de création" }
        },
        searchResultFields: []
    },
    elements: {
        url: "/api/expositions/elements/search/",
        defaultSearchParam: "nom",
        searchParams: {
            numero: { ...textSearchParam, label: "Numéro"},
            nom: textSearchParam,
            commentaire: textSearchParam,
            coefficient: { ...numberSearchParam, minValue: 0 },
            exposition_id: { ...itemSearchParam, type: "expositions" },
            etat_id: { ...itemSearchParam, type: "etats_elements", label: "État" },
            exploitation_id: { ...itemSearchParam, type: "exploitations_elements", label: "Exploitation" },
            localisation_id: { ...itemSearchParam, type: "localisations_elements", label: "Localisation" },
            categories: { ...itemListSearchParam, item: "categories_elements", label: "Catégories" },
            date_creation: { ...dateSearchParam, label: "Date de création" }
        },
        searchResultFields: [
            "exposition_id",
            "numero"
        ]
    },
    constituents: {
        url: "/api/expositions/elements/constituents/search/",
        defaultSearchParam: "nom",
        searchParams: {
            nom: textSearchParam,
            quantite: { ...numberSearchParam, label: "Quantité" },
            quantite_operator: numberOperatorSearchParam,
            element_id: { ...itemSearchParam, type: "elements", label: "Élément" },
            article_id: { ...itemSearchParam, type: "articles" },
            date_creation: { ...dateSearchParam, label: "Date de création" }
        },
        searchResultFields: [
            "article_id",
            "quantite"
        ]
    },
    fiches: {
        url: "/api/fiches/search/",
        defaultSearchParam: "nom",
        searchParams: {
            nom: { ...textSearchParam, label: "Titre" },
            auteur_id: { ...itemSearchParam, type: "users", label: "Auteur de la fiche" },
            ilot_id: { ...itemSearchParam, type: "ilots", label: "Îlot" },
            exposition_id: { ...itemSearchParam, type: "expositions" },
            element_id: { ...itemSearchParam, type: "elements", label: "Élément" },
            date_debut: { ...dateSearchParam, label: "Date de début" },
            date_fin: { ...dateSearchParam, label: "Date de fin"},
            type_id: { ...itemSearchParam, type: "types_operations", label: "Type d'opération" },
            nature_id: { ...itemSearchParam, type: "natures_operations", label: "Nature de l'opération" },
            description: textSearchParam,
            remarque: textSearchParam,
            numero_di: { ...textSearchParam, label: "Numéro de la DI" },
            validation: booleanSearchParam,
            user_en_charge_id: { ...itemSearchParam, type: "users", label: "Utilisateur en charge" },
            is_active: { ...booleanSearchParam, defaultValue: true, label: "Active" },
            status_id: { ...itemSearchParam, type: "fiches_status", label: "Status" },
            tags: { ...itemListSearchParam, item: "tags" },
            date_creation: { ...dateSearchParam, label: "Date de création"}
        },
        searchResultFields: [
            "user_en_charge_id",
            "ilot_id",
            "exposition_id",
            "element_id",
            "tags"
        ]
    },
    fiches_systematiques: {
        url: "/api/fiches/systematiques/search/",
        defaultSearchParam: "nom",
        searchParams: {
            nom: { ...textSearchParam, label: "Titre" },
            auteur_id: { ...itemSearchParam, type: "users", label: "Auteur de la fiche" },
            ilot_id: { ...itemSearchParam, type: "ilots", label: "Îlot" },
            exposition_id: { ...itemSearchParam, type: "expositions" },
            element_id: { ...itemSearchParam, type: "elements", label: "Élément" },
            nature_id: { ...itemSearchParam, type: "natures_operations", label: "Nature de l'opération" },
            description: textSearchParam,
            informations: textSearchParam,
            user_en_charge_id: { ...itemSearchParam, type: "users", label: "Utilisateur en charge" },
            periodicite: { ...timeDeltaSearchParam, label: "Periodicité" },
            periodicite_operator: numberOperatorSearchParam,
            rappel: timeDeltaSearchParam,
            rappel_operator: numberOperatorSearchParam,
            date_initiale: dateSearchParam,
            date_prochaine: dateSearchParam,
            is_active: { ...booleanSearchParam, defaultValue: true, label: "Active" },
            tags: { ...itemListSearchParam, item: "tags" },
            date_creation: { ...dateSearchParam, label: "Date de création" }
        },
        searchResultFields: [
            "user_en_charge_id",
            "ilot_id",
            "exposition_id",
            "element_id",
            "date_prochaine"
        ]
    },
    historiques_fiches_systematiques: {
        url: "api/fiches/systematiques/historique/search/",
        defaultSearchParam: "",
        searchParams: {
            fiche_id: { ...itemSearchParam, type: "fiches_systematiques", label: "Fiche systématique"  },
            user_id: { ...itemSearchParam, type: "users", label: "Utilisateur" },
            commentaire: textSearchParam,
            date: dateSearchParam
        },
        searchResultFields: [
            "user_id",
            "fiche_id",
            "date"
        ]
    }
}

// used to parse SearchParam objects into URL queries


export const searchQueryParams = {
    users:  [
        'username',
        'prenom',
        'nom',
        'email',
        'role_id'
    ],
    fichiers: [
        'nom',
        'user_id',
        'ilot_id',
        'exposition_id',
        'article_id',
        'element_id'
    ],
    ilots: [
        'numero',
        'nom',
        'localisation_id',
        'annee_creation',
        'mois_creation',
        'jour_creation'
    ],
    expositions:  [
        'nom',
        'ilot_id',
        'regie_id',
        'annee',
        'annee_creation',
        'mois_creation',
        'jour_creation',
        'commentaire',
        'is_active',
    ],
    articles: [
        'nom',
        'code',
        'categorie_id',
        'lieu_stockage_id',
        'stock_id',
        'quantite',
        'quantite_inf',
        'quantite_inf_eg',
        'quantite_sup',
        'quantite_sup_eg',
        'description',
        'fournisseur',
        'annee_creation',
        'mois_creation',
        'jour_creation'
    ],
    historiques_stocks: [
        'article_id',
        'user_id',
        'stock_id',
        'constituent_id',
        'quantite',
        'quantite_inf',
        'quantite_inf_eg',
        'quantite_sup',
        'quantite_sup_eg',
        'annee_creation',
        'mois_creation',
        'jour_creation'
    ],
    stocks: [
        'nom',
        'annee_creation',
        'mois_creation',
        'jour_creation'
    ],
    elements: [
        'numero',
        'nom',
        'commentaire',
        'coefficient',
        'exposition_id',
        'etat_id',
        'exploitation_id',
        'localisation_id',
        'categories',
        'annee_creation',
        'mois_creation',
        'jour_creation'
    ],
    constituents: [
        'nom',
        'quantite',
        'quantite_inf',
        'quantite_inf_eg',
        'quantite_sup',
        'quantite_sup_eg',
        'element_id',
        'article_id',
        'annee_creation',
        'mois_creation',
        'jour_creation'
    ],
    fiches: [
        'nom',
        'auteur_id',
        'ilot_id',
        'exposition_id',
        'element_id',
        'annee_debut',
        'mois_debut',
        'jour_debut',
        'annee_fin',
        'mois_fin',
        'jour_fin',
        'type_id',
        'nature_id',
        'description',
        'remarque',
        'numero_di',
        'validation',
        'user_en_charge_id',
        'is_active',
        'tags',
        'annee_creation',
        'mois_creation',
        'jour_creation'
    ],
    fiches_systematiques: [
        'nom',
        'auteur_id',
        'ilot_id',
        'exposition_id',
        'element_id',
        'nature_id',
        'description',
        'informations',
        'user_en_charge_id',
        'periodicite',
        'periodicite_operator',
        'rappel',
        'rappel_operator',
        'annee_initiale',
        'mois_initiale',
        'jour_initiale',
        'annee_prochaine',
        'mois_prochaine',
        'jour_prochaine',
        'is_active',
        'tags',
        'annee_creation',
        'mois_creation',
        'jour_creation'
    ],
    historiques_fiches_systematiques: [
        'fiche_id',
        'user_id',
        'commentaire',
        'annee_date',
        'mois_date',
        'jour_date'
    ]
}