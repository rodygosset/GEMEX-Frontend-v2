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
    taux: string;
    [key: string]: string;
}

export const RapportTauxDisponibiliteFlatHeaders = [
    { id: "nom", title: "Nom" },
    { id: "type", title: "Type" },
    { id: "taux", title: "Taux" },
];


/**
 * Flatten a RapportTauxDisponibilite object into an array of RapportTauxDisponibiliteFlat
 * @param rapport The RapportTauxDisponibilite to flatten
 * @returns An array of RapportTauxDisponibiliteFlat
 */

export const flattenRapportTauxDisponibilite = (rapport: RapportTauxDisponibilite): RapportTauxDisponibiliteFlat[] => {
    const flat: RapportTauxDisponibiliteFlat[] = []
    // flatten the data for the global report
    flat.push({
        nom: "Rapport global",
        type: "rapport",
        taux: rapport.taux.toFixed(3),
        ...rapport.taux_semaine.reduce((acc, week, index) => ({ ...acc, [`taux_semaine_${index}`]: week.taux.toFixed(3) }), {})
    })
    // flatten the data for each group
    // start with the global data for the group
    rapport.groupes_expositions.forEach(groupe => {
        flat.push({
            nom: groupe.nom,
            type: "groupe",
            taux: groupe.taux.toFixed(3),
            ...groupe.taux_semaine.reduce((acc, week, index) => ({ ...acc, [`taux_semaine_${index}`]: week.taux.toFixed(3) }), {})
        })
        // then add the data for each exposition in the group
        groupe.expositions.forEach(exposition => {
            flat.push({
                nom: exposition.nom,
                type: "exposition",
                taux: exposition.taux.toFixed(3),
                ...exposition.taux_semaine.reduce((acc, week, index) => ({ ...acc, [`taux_semaine_${index}`]: week.taux.toFixed(3) }), {})
            })
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
    const headersConf = [...RapportTauxDisponibiliteFlatHeaders, ...rapport.taux_semaine.map((week, index) => ({ id: `taux_semaine_${index}`, title: `Taux semaine du ${week.date_debut} au ${week.date_fin}` }))]
    const headers = headersConf.map(header => header.title)
    // @ts-ignore
    const rows = flat.map(row => headersConf.map(header => row[header.id]))
    return [headers, ...rows].map(row => row.join(",")).join("\n")
}