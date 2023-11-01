// Data models for the quality module
// they correspond to the data models in the backend, which we retrieve from the API

export interface Evaluation {
	id: number
	mois_cycle_id: number
	date_rendu_reelle?: string
	date_rendu: string
	user_id: number
	element_id: number
	thematique_id: number
	question_note?: number
	note_a?: number
	note_b?: number
	note_c?: number
	note_d?: number
	note_e?: number
	note?: number
	reponses: {
		evaluation_id: number
		question_id: number
		note: number
		id: number
	}[]
	commentaire: string
	approved: boolean
}

export interface EvaluationCreate {
	mois_cycle_id: number
	date_rendu: string
	user_id: number
	element_id: number
	thematique_id: number
}

export interface MoisCycle {
	id: number
	cycle_id: number
	mois: number
	note?: number
	done: boolean
	evaluations: Evaluation[]
}

export interface Cycle {
	id: number
	note?: number
	date_debut: string
	date_fin: string
	mois_cycle: MoisCycle[]
	expositions: {
		cycle_id: number
		exposition_id: number
	}[]
}

export interface QuestionCreate {
	id: number
	titre?: string
	question: string
	description: string
	grille: boolean
	optional: boolean
}

export interface Thematique {
	id: number
	nom: string
	description: string
	question_grille: string
	grille_de_notes: boolean
	periodicite: number // in months
	ponderateur: number
	questions: {
		titre?: string
		question: string
		description: string
		grille: boolean
		optional: boolean
		thematique_id: number
		id: number
	}[]
	question: string
	question_ponderateur: number
	domaine_id: number
}

export interface Domaine {
	id: number
	nom: string
	description: string
	thematiques: Thematique[]
}

/**
 * Convert a list of thematiques to a CSV string
 * @param domaines the list of Domaine objects which contain the thematiques
 * @returns the CSV string
 */
export const thematiquesToCSV = (domaines: Domaine[]) => {
	// each thematique is a row
	// with the columns: nom, description, periodicite, ponderateur, question, question_ponderateur, domaine
	// & question_[i] for each question -> this requires finding the longest list of questions and using that as the number of columns

	// first, find the longest list of questions

	const thematiques = domaines.map((d) => d.thematiques).flat()
	const maxQuestions = thematiques.reduce((max, t) => Math.max(max, t.questions.length), 0)

	// now, create the CSV string

	let csv = "Nom;Description;Periodicite en mois;Ponderateur;Question générale;Ponderateur question générale;Domaine d'évaluation"
	for (let i = 0; i < maxQuestions; i++) {
		csv += `;Question ${i + 1}`
	}

	csv += "\n"

	for (const domaine of domaines) {
		for (const thematique of domaine.thematiques) {
			csv += `"${thematique.nom}";"${thematique.description}";${thematique.periodicite};${thematique.ponderateur};"${thematique.question}";${thematique.question_ponderateur};"${domaine.nom}"`
			for (let i = 0; i < maxQuestions; i++) {
				csv += `;${thematique.questions[i]?.question ?? ""}`
			}
			csv += "\n"
		}
	}

	return csv
}
