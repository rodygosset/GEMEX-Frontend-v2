import { faBox, faBoxOpen, faFile, faFileAlt, faLayerGroup, faMonument, faPuzzlePiece, faUser, IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { toSingular } from "@utils/general"
import { SelectOption } from "@utils/react-select/types"

export const defaultSearchItem = "elements"

// type & const definitions for the search filters component

export interface SearchResultsCount {
	nb_results: number
}

export interface SearchResultsMetaData {
	[attr: string]: {
		ids: number[]
		values: string[]
	}
}

export interface SearchFilterProps {
	name: string
	filter: SearchFilter
	onChange: OnFilterChangeHandler
	onToggle: OnFilterToggleHandler
	getOperatorValue?: (filterName: string) => string
	setOperatorValue?: (filterName: string, operatorValue: string) => void
}

export type OnFilterChangeHandler = (filterName: string, newValue: any) => void
export type OnFilterToggleHandler = (filterName: string, checked: boolean) => void

export const getFilterLabel = (filterName: string, conf: SearchParam) => {
	return typeof conf.label !== "undefined" ? conf.label : toSingular(filterName)
}

// item types

export const itemTypes: SelectOption<string>[] = [
	{
		value: "fiches",
		label: "Fiches"
	},
	{
		value: "fiches_systematiques",
		label: "Fiches Systématiques"
	},
	{
		value: "expositions",
		label: "Expositions"
	},
	{
		value: "elements",
		label: "Éléments"
	},
	{
		value: "stocks",
		label: "Stocks"
	},
	{
		value: "articles",
		label: "Articles"
	}
]

// item icons

export interface SearchItemIconConf {
	[propName: string]: IconDefinition
}

export const searchItemIcons: SearchItemIconConf = {
	users: faUser,
	fichiers: faFile,
	expositions: faMonument,
	articles: faBoxOpen,
	historiques_stocks: faFileAlt,
	stocks: faLayerGroup,
	elements: faBox,
	constituents: faPuzzlePiece,
	fiches: faFileAlt,
	fiches_systematiques: faFileAlt,
	historiques_fiches_systematiques: faFileAlt
}

export type SearchFilters = { [param: string]: SearchFilter }

export interface SearchFilter {
	value: any
	conf: SearchParam
	checked: boolean
}

export interface SearchParam {
	type: string
	item?: string
	label?: string
	strict?: boolean // only affects date search params
	defaultValue?: any
	minValue?: any
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
	type: "timeDelta"
}

export const itemSearchParam: SearchParam = {
	type: "",
	defaultValue: null,
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
	url: string
	defaultSearchParam: string
	searchParams: { [propName: string]: SearchParam }
	searchResultFields: string[]
}

// our entire search conf object

export interface SearchConf {
	[propName: string]: ItemSearchConf
}

export const searchConf: SearchConf = {
	users: {
		url: "/api/backend/users/search/",
		defaultSearchParam: "username",
		searchParams: {
			username: { ...textSearchParam, label: "Nom d'utilisateur" },
			prenom: { ...textSearchParam, label: "Prénom" },
			nom: textSearchParam,
			role_id: { ...itemSearchParam, type: "roles", label: "Rôle" },
			groups: { ...itemListSearchParam, item: "groups", label: "Groupes" },
			is_active: { ...booleanSearchParam, label: "Actif" }
		},
		searchResultFields: ["prenom", "nom", "email"]
	},
	roles: {
		url: "/api/backend/users/roles/search/",
		defaultSearchParam: "titre",
		searchParams: {
			titre: textSearchParam,
			permissions: { ...itemListSearchParam, label: "Permission" },
			suppression: { ...itemListSearchParam, label: "Suppression" }
		},
		searchResultFields: []
	},
	groups: {
		url: "/api/backend/users/groups/search/",
		defaultSearchParam: "nom",
		searchParams: {
			nom: textSearchParam
		},
		searchResultFields: []
	},
	fichiers: {
		url: "/api/backend/fichiers/search/",
		defaultSearchParam: "nom",
		searchParams: {
			nom: textSearchParam,
			user_id: { ...itemSearchParam, type: "users", label: "Auteur du fichier" },
			exposition_id: { ...itemSearchParam, type: "expositions", label: "Exposition" },
			article_id: { ...itemSearchParam, type: "articles", label: "Article" },
			element_id: { ...itemSearchParam, type: "elements", label: "Élément" }
		},
		searchResultFields: []
	},
	expositions: {
		url: "/api/backend/expositions/search/",
		defaultSearchParam: "nom",
		searchParams: {
			nom: textSearchParam,
			regie_id: { ...itemSearchParam, type: "regies", label: "Régie" },
			annee: { ...numberSearchParam, defaultValue: new Date().getFullYear(), label: "Année" },
			date_creation: { ...dateSearchParam, label: "Date de création" },
			commentaire: textSearchParam,
			is_active: { ...booleanSearchParam, defaultValue: true, label: "Active" }
		},
		searchResultFields: ["regie_id", "annee"]
	},
	articles: {
		url: "/api/backend/stocks/articles/search/",
		defaultSearchParam: "nom",
		searchParams: {
			nom: textSearchParam,
			code: textSearchParam,
			categorie_id: { ...itemSearchParam, type: "categories_articles", label: "Catégorie" },
			lieu_stockage_id: { ...itemSearchParam, type: "lieux_stockage_articles", label: "Lieu de stockage" },
			stock_id: { ...itemSearchParam, type: "stocks", label: "Stock" },
			quantite: { ...numberSearchParam, label: "Quantité" },
			quantite_operator: numberOperatorSearchParam,
			description: textSearchParam,
			fournisseur: textSearchParam,
			date_creation: { ...dateSearchParam, label: "Date de création" }
		},
		searchResultFields: ["categorie_id", "quantite"]
	},
	historiques_stocks: {
		url: "/api/backend/stocks/historique/search/",
		defaultSearchParam: "article_id",
		searchParams: {
			article_id: { ...itemSearchParam, type: "articles", label: "Article" },
			user_id: { ...itemSearchParam, type: "users", label: "Utilisateur" },
			stock_id: { ...itemSearchParam, type: "stocks", label: "Stock" },
			constituent_id: { ...itemSearchParam, type: "constituents", label: "Constituent" },
			quantite: { ...numberSearchParam, label: "Quantité" },
			quantite_operator: numberOperatorSearchParam,
			date_creation: { ...dateSearchParam, label: "Date de création" }
		},
		searchResultFields: ["article_id", "quantite"]
	},
	stocks: {
		url: "/api/backend/stocks/search/",
		defaultSearchParam: "nom",
		searchParams: {
			nom: textSearchParam,
			date_creation: { ...dateSearchParam, label: "Date de création" }
		},
		searchResultFields: []
	},
	elements: {
		url: "/api/backend/expositions/elements/search/",
		defaultSearchParam: "nom",
		searchParams: {
			numero: { ...textSearchParam, label: "Numéro" },
			nom: textSearchParam,
			commentaire: textSearchParam,
			coefficient: { ...numberSearchParam, minValue: 0 },
			exposition_id: { ...itemSearchParam, type: "expositions", label: "Exposition" },
			etat_id: { ...itemSearchParam, type: "etats_elements", label: "État" },
			exploitation_id: { ...itemSearchParam, type: "exploitations_elements", label: "Exploitation" },
			localisation_id: { ...itemSearchParam, type: "localisations_elements", label: "Localisation" },
			categories: { ...itemListSearchParam, item: "categories_elements", label: "Catégories" },
			date_creation: { ...dateSearchParam, label: "Date de création" }
		},
		searchResultFields: ["exposition_id", "numero"]
	},
	constituents: {
		url: "/api/backend/expositions/elements/constituents/search/",
		defaultSearchParam: "nom",
		searchParams: {
			nom: textSearchParam,
			quantite: { ...numberSearchParam, label: "Quantité" },
			quantite_operator: numberOperatorSearchParam,
			element_id: { ...itemSearchParam, type: "elements", label: "Élément" },
			article_id: { ...itemSearchParam, type: "articles", label: "Article" },
			date_creation: { ...dateSearchParam, label: "Date de création" }
		},
		searchResultFields: ["article_id", "quantite"]
	},
	fiches: {
		url: "/api/backend/fiches/search/",
		defaultSearchParam: "nom",
		searchParams: {
			nom: { ...textSearchParam, label: "Titre" },
			auteur_id: { ...itemSearchParam, type: "users", label: "Auteur de la fiche" },
			exposition_id: { ...itemSearchParam, type: "expositions", label: "Exposition" },
			element_id: { ...itemSearchParam, type: "elements", label: "Élément" },
			date_debut: { ...dateSearchParam, label: "Date de début", strict: true },
			date_fin: { ...dateSearchParam, label: "Date de fin", strict: true },
			type_id: { ...itemSearchParam, type: "types_operations", label: "Type d'opération" },
			nature_id: { ...itemSearchParam, type: "natures_operations", label: "Nature de l'opération" },
			description: textSearchParam,
			remarque: textSearchParam,
			numero_di: { ...textSearchParam, label: "Numéro de la DI" },
			validation: booleanSearchParam,
			user_en_charge_id: { ...itemSearchParam, type: "users", label: "Utilisateur en charge" },
			groups: { ...itemListSearchParam, item: "groups" },
			is_active: { ...booleanSearchParam, defaultValue: true, label: "Active" },
			status_id: { ...itemSearchParam, type: "fiches_status", label: "Status" },
			tags: { ...itemListSearchParam, item: "tags" },
			date_creation: { ...dateSearchParam, label: "Date de création" }
		},
		searchResultFields: ["user_en_charge_id", "exposition_id", "element_id"]
	},
	fiches_systematiques: {
		url: "/api/backend/fiches/systematiques/search/",
		defaultSearchParam: "nom",
		searchParams: {
			nom: { ...textSearchParam, label: "Titre" },
			auteur_id: { ...itemSearchParam, type: "users", label: "Auteur de la fiche" },
			exposition_id: { ...itemSearchParam, type: "expositions", label: "Exposition" },
			element_id: { ...itemSearchParam, type: "elements", label: "Élément" },
			nature_id: { ...itemSearchParam, type: "natures_operations", label: "Nature de l'opération" },
			description: textSearchParam,
			informations: textSearchParam,
			user_en_charge_id: { ...itemSearchParam, type: "users", label: "Utilisateur en charge" },
			groups: { ...itemListSearchParam, item: "groups" },
			periodicite: { ...timeDeltaSearchParam, label: "Periodicité" },
			periodicite_operator: numberOperatorSearchParam,
			rappel: timeDeltaSearchParam,
			rappel_operator: numberOperatorSearchParam,
			date_initiale: { ...dateSearchParam, label: "Date initiale" },
			date_prochaine: { ...dateSearchParam, label: "Date prochaine" },
			is_active: { ...booleanSearchParam, defaultValue: true, label: "Active" },
			tags: { ...itemListSearchParam, item: "tags" },
			date_creation: { ...dateSearchParam, label: "Date de création" }
		},
		searchResultFields: ["user_en_charge_id", "exposition_id", "element_id"]
	},
	historiques_fiches_systematiques: {
		url: "/api/backend/fiches/systematiques/historique/search/",
		defaultSearchParam: "",
		searchParams: {
			fiche_id: { ...itemSearchParam, type: "fiches_systematiques", label: "Fiche systématique" },
			user_id: { ...itemSearchParam, type: "users", label: "Utilisateur" },
			commentaire: textSearchParam,
			date: dateSearchParam
		},
		searchResultFields: ["user_id", "fiche_id", "date"]
	},
	rapports: {
		url: "/api/backend/rapports_taux_disponibilite/search/",
		defaultSearchParam: "",
		searchParams: {
			date_debut: { ...dateSearchParam, label: "Date de début", strict: true },
			date_fin: { ...dateSearchParam, label: "Date de fin", strict: true },
			groupes_expositions: { ...itemListSearchParam, item: "groupes_expositions" }
		},
		searchResultFields: ["date_debut", "date_fin"]
	},
	evaluations: {
		url: "/api/backend/qualite/evaluations/search",
		defaultSearchParam: "",
		searchParams: {
			mois_cycle_id: { ...itemSearchParam, type: "mois_cycle", label: "Mois de l'évaluation" },
			date_rendu: { ...dateSearchParam, label: "Date de rendu" },
			date_rendu_reelle: { ...dateSearchParam, label: "Date de rendu réelle" },
			user_id: { ...itemSearchParam, type: "users", label: "Évaluateur" },
			element_id: { ...itemSearchParam, type: "elements", label: "Élément" },
			thematique_id: { ...itemSearchParam, type: "thematiques", label: "Thématique" },
			question_note: { ...numberSearchParam, label: "Note de la question principale" },
			note_a: { ...numberSearchParam, label: "Nombre de note A données au cours de l'évaluation" },
			note_b: { ...numberSearchParam, label: "Nombre de note B données au cours de l'évaluation" },
			note_c: { ...numberSearchParam, label: "Nombre de note C données au cours de l'évaluation" },
			note_d: { ...numberSearchParam, label: "Nombre de note D données au cours de l'évaluation" },
			note_e: { ...numberSearchParam, label: "Nombre de note E données au cours de l'évaluation" },
			note: { ...numberSearchParam, label: "Note de l'évaluation" },
			commentaire: textSearchParam,
			approved: { ...booleanSearchParam, label: "Approuvé" }
		},
		searchResultFields: ["thematique_id", "note"]
	}
}

// used to parse SearchParam objects into URL queries

export type StringArrayObj = { [key: string]: string[] }

export const searchQueryParams: StringArrayObj = {
	users: ["username", "prenom", "nom", "email", "role_id", "groups"],
	roles: ["titre", "permissions", "suppression"],
	groups: ["nom"],
	fichiers: ["nom", "user_id", "exposition_id", "article_id", "element_id"],
	expositions: ["nom", "regie_id", "annee", "annee_creation", "mois_creation", "jour_creation", "commentaire", "is_active"],
	articles: [
		"nom",
		"code",
		"categorie_id",
		"lieu_stockage_id",
		"stock_id",
		"quantite",
		"quantite_inf",
		"quantite_inf_eg",
		"quantite_sup",
		"quantite_sup_eg",
		"description",
		"fournisseur",
		"annee_creation",
		"mois_creation",
		"jour_creation"
	],
	historiques_stocks: [
		"article_id",
		"user_id",
		"stock_id",
		"constituent_id",
		"quantite",
		"quantite_inf",
		"quantite_inf_eg",
		"quantite_sup",
		"quantite_sup_eg",
		"annee_creation",
		"mois_creation",
		"jour_creation"
	],
	stocks: ["nom", "annee_creation", "mois_creation", "jour_creation"],
	elements: [
		"numero",
		"nom",
		"commentaire",
		"coefficient",
		"exposition_id",
		"etat_id",
		"exploitation_id",
		"localisation_id",
		"categories",
		"annee_creation",
		"mois_creation",
		"jour_creation"
	],
	constituents: [
		"nom",
		"quantite",
		"quantite_inf",
		"quantite_inf_eg",
		"quantite_sup",
		"quantite_sup_eg",
		"element_id",
		"article_id",
		"annee_creation",
		"mois_creation",
		"jour_creation"
	],
	fiches: [
		"nom",
		"auteur_id",
		"exposition_id",
		"element_id",
		"date_debut",
		"date_fin",
		"type_id",
		"nature_id",
		"description",
		"remarque",
		"numero_di",
		"validation",
		"user_en_charge_id",
		"groups",
		"status_id",
		"is_active",
		"tags",
		"annee_creation",
		"mois_creation",
		"jour_creation"
	],
	fiches_systematiques: [
		"nom",
		"auteur_id",
		"exposition_id",
		"element_id",
		"nature_id",
		"description",
		"informations",
		"user_en_charge_id",
		"groups",
		"periodicite",
		"periodicite_inf",
		"periodicite_inf_eg",
		"periodicite_sup",
		"periodicite_sup_eg",
		"rappel",
		"rappel_inf",
		"rappel_inf_eg",
		"rappel_sup",
		"rappel_sup_eg",
		"annee_initiale",
		"mois_initiale",
		"jour_initiale",
		"annee_prochaine",
		"mois_prochaine",
		"jour_prochaine",
		"is_active",
		"tags",
		"annee_creation",
		"mois_creation",
		"jour_creation"
	],
	historiques_fiches_systematiques: ["fiche_id", "user_id", "commentaire", "annee_date", "mois_date", "jour_date"],
	rapports: ["date_debut", "date_fin", "groupes_expositions"]
}
