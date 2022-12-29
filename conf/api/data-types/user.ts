


export interface User {
    username: string,
    prenom: string,
    nom: string,
    role_id: number,
    groups: string[],
    modifications: string,
    id: number,
    is_active: boolean
}

export interface UserRole {
    titre: string,
    permissions: string,
    suppression: string,
    id: number
}

export interface UserGroup {
    nom: string,
    id: number
}

