


const localhostURL = "http://localhost:8000"
const prodServerURL = "http://vm-gemex.citepro.cite-sciences.fr:8000"

// export const apiURL = process.env.NODE_ENV == "production" ? prodServerURL : localhostURL
export const apiURL = prodServerURL

// export const dockerAPIURL = "http://host.docker.internal:8000"
export const dockerAPIURL = prodServerURL
// export const dockerAPIURL = localhostURL


interface APIURLsType {
    [item: string]: string
} 

export const apiURLs: APIURLsType = {
    users: "/api/users/",
    roles: "/api/users/roles/",
    groups: "/api/users/groups/",
    fichiers: "/api/fichiers/",
    localisations_ilots: "/api/ilots/localisations/",
    ilots: "/api/ilots/",
    notifications: "/api/notifications/",
    regies: "/api/expositions/regies/",
    expositions: "/api/expositions/",
    categories_articles: "/api/stocks/articles/categories/",
    lieux_stockage_articles: "/api/stocks/articles/lieux_stockage/",
    articles: "/api/stocks/articles/",
    historiques_stocks: "/api/stocks/historique/",
    stocks: "/api/stocks/",
    categories_elements: "/api/expositions/elements/categories/",
    etats_elements: "/api/expositions/elements/etats/",
    exploitations_elements: "/api/expositions/elements/exploitations/",
    localisations_elements: "/api/expositions/elements/localisations/",
    elements: "/api/expositions/elements/",
    constituents: "/api/expositions/elements/constituents/",
    tags: "/api/fiches/tags/",
    types_operations: "/api/fiches/types_operations/",
    natures_operations: "/api/fiches/natures_operations/",
    fiches_status: "/api/fiches/status/",
    fiches: "/api/fiches/",
    fiches_systematiques: "/api/fiches/systematiques/",
    historiques_fiches_systematiques: "/api/fiches/systematiques/historique/"
}


// for fiche systematique objects

export const TO_BE_ASSIGNED_TAG = "À attribuer"


// permissions for each item type

interface ItemTypesPermissionsType {
    [itemType: string]: string;
} 

export const itemTypesPermissions: ItemTypesPermissionsType = {
    users: "users",
    roles: "users",
    groups: "users",
    ilots: "ilots",
    expositions: "expositions",
    articles: "stocks",
    historiques_stocks: "stocks",
    stocks: "stocks",
    elements: "elements",
    constituents: "stocks",
    fiches: "fiches",
    fiches_systematiques: "systematiques",
    historiques_fiches_systematiques: "historique"
}
