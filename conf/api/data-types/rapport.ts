export interface ExpoGroupCreate {
    nom: string;
    expositions: { nom: string, id: number }[];
}

export interface ExpoGroupPost {
    nom: string;
    expositions: { exposition_id: number }[];
}


export interface RapportCreate {
    date_debut: string;
    date_fin: string;
    groupes_expositions: ExpoGroupPost[];
}


export interface TauxSemaine {
    date_debut: string;
    date_fin: string;
    taux: number;
    id: number;
}

export interface ExpoRapport {
    exposition_id: number;
    nom: string;
    groupe_id: number;
    taux: number;
    taux_semaine: TauxSemaine[];
    id: number;
}

export interface ExpoGroup {
    nom: string;
    rapport_id: number;
    taux: number;
    taux_semaine: TauxSemaine[];
    expositions: ExpoRapport[];
    id: number;
}

export interface RapportTauxDisponibilite {
    date_debut: string;
    date_fin: string;
    taux: number;
    taux_semaine: TauxSemaine[];
    groupes_expositions: ExpoGroup[];
    id: number;
}


// this type is used for CSV export
export interface RapportTauxDisponibiliteFlat {
    nom: string;
    type: "exposition" | "groupe" | "rapport";
    date_debut: string;
    date_fin: string;
    taux: number;
}

export const RapportTauxDisponibiliteFlatHeaders = [
    { id: "nom", title: "Nom" },
    { id: "type", title: "Type" },
    { id: "date_debut", title: "Date début" },
    { id: "date_fin", title: "Date fin" },
    { id: "taux", title: "Taux" },
];


/**
 * Flatten a RapportTauxDisponibilite object into an array of RapportTauxDisponibiliteFlat
 * @param rapport The RapportTauxDisponibilite to flatten
 * @returns An array of RapportTauxDisponibiliteFlat
 */

export const flattenRapportTauxDisponibilite = (rapport: RapportTauxDisponibilite): RapportTauxDisponibiliteFlat[] => {
    const flat: RapportTauxDisponibiliteFlat[] = []
    // for each groupe, add a line with the groupe name and ratio
    rapport.groupes_expositions.forEach(groupe => {
        flat.push({
            nom: groupe.nom,
            type: "groupe",
            date_debut: rapport.date_debut,
            date_fin: rapport.date_fin,
            taux: groupe.taux,
        })
        // for each week in the period, add a line for the groupe
        groupe.taux_semaine.forEach(semaine => {
            flat.push({
                nom: groupe.nom,
                type: "groupe",
                date_debut: semaine.date_debut,
                date_fin: semaine.date_fin,
                taux: semaine.taux,
            })
        })
        // for each exposition, add a line with the exposition name and ratio
        groupe.expositions.forEach(expo => {
            flat.push({
                nom: expo.nom,
                type: "exposition",
                date_debut: rapport.date_debut,
                date_fin: rapport.date_fin,
                taux: expo.taux,
            })
            // for each week in the period, add a line for the exposition
            expo.taux_semaine.forEach(semaine => {
                flat.push({
                    nom: expo.nom,
                    type: "exposition",
                    date_debut: semaine.date_debut,
                    date_fin: semaine.date_fin,
                    taux: semaine.taux,
                })
            })
        })
    })
    // add a line with the global ratio
    flat.push({
        nom: "",
        type: "rapport",
        date_debut: rapport.date_debut,
        date_fin: rapport.date_fin,
        taux: rapport.taux,
    })
    // for each week in the period, add a line for the global ratio
    rapport.taux_semaine.forEach(semaine => {
        flat.push({
            nom: "",
            type: "rapport",
            date_debut: semaine.date_debut,
            date_fin: semaine.date_fin,
            taux: semaine.taux,
        })
    })
    return flat
}

/**
 * Convert a RapportTauxDisponibilite to CSV
 * @param rapport The RapportTauxDisponibilite to convert to CSV
 * @returns A CSV string
 */
 
export const rapportToCSV = (rapport: RapportTauxDisponibilite): string => {
    const flat = flattenRapportTauxDisponibilite(rapport)
    const headers = RapportTauxDisponibiliteFlatHeaders.map(h => h.title)
    // @ts-ignore
    const rows = flat.map(row => RapportTauxDisponibiliteFlatHeaders.map(header => row[header.id]))
    return [headers, ...rows].map(row => row.join(",")).join("\n")
}