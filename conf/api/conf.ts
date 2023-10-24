const localhostURL = "http://127.0.0.1:8000"
const prodServerURL = "http://vm-gemex.citepro.cite-sciences.fr:8000"

export const apiURL = process.env.NODE_ENV == "production" ? prodServerURL : localhostURL
// export const apiURL = prodServerURL

interface APIURLsType {
	[item: string]: string
}

export const apiURLs: APIURLsType = {
	users: "/api/backend/users/",
	roles: "/api/backend/users/roles/",
	groups: "/api/backend/users/groups/",
	fichiers: "/api/backend/fichiers/",
	notifications: "/api/backend/notifications/",
	regies: "/api/backend/expositions/regies/",
	expositions: "/api/backend/expositions/",
	categories_articles: "/api/backend/stocks/articles/categories/",
	lieux_stockage_articles: "/api/backend/stocks/articles/lieux_stockage/",
	articles: "/api/backend/stocks/articles/",
	historiques_stocks: "/api/backend/stocks/historique/",
	stocks: "/api/backend/stocks/",
	categories_elements: "/api/backend/expositions/elements/categories/",
	etats_elements: "/api/backend/expositions/elements/etats/",
	exploitations_elements: "/api/backend/expositions/elements/exploitations/",
	localisations_elements: "/api/backend/expositions/elements/localisations/",
	elements: "/api/backend/expositions/elements/",
	constituents: "/api/backend/expositions/elements/constituents/",
	tags: "/api/backend/fiches/tags/",
	types_operations: "/api/backend/fiches/types_operations/",
	natures_operations: "/api/backend/fiches/natures_operations/",
	fiches_status: "/api/backend/fiches/status/",
	fiches: "/api/backend/fiches/",
	fiches_systematiques: "/api/backend/fiches/systematiques/",
	historiques_fiches_systematiques: "/api/backend/fiches/systematiques/historique/",
	rapports: "/api/backend/rapports_taux_disponibilite/",
	cycles: "/api/backend/qualite/cycles/",
	mois_cycle: "/api/backend/qualite/cycles/mois/",
	evaluations: "/api/backend/qualite/evaluations/",
	domaines: "/api/backend/qualite/domaines/",
	thematiques: "/api/backend/qualite/thematiques/",
	questions_thematiques: "/api/backend/qualite/thematiques/questions/"
}

// for fiche systematique objects

export const TO_BE_ASSIGNED_TAG = "À attribuer"

// permissions for each item type

interface ItemTypesPermissionsType {
	[itemType: string]: string
}

export const itemTypesPermissions: ItemTypesPermissionsType = {
	users: "users",
	roles: "users",
	groups: "users",
	expositions: "expositions",
	articles: "stocks",
	historiques_stocks: "stocks",
	stocks: "stocks",
	elements: "elements",
	constituents: "stocks",
	fiches: "fiches",
	fiches_systematiques: "systematiques",
	historiques_fiches_systematiques: "historique",
	qualite: "qualite"
}
