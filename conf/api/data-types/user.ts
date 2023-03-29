


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

export interface UserCreate {
    username: string;
    prenom: string;
    nom: string;
    hashed_password: string;
    role_id: number;
    groups: string[];
}

export interface UserUpdate {
    username?: string;
    prenom?: string;
    nom?: string;
    role_id?: number;
    groups?: string[];
    is_active?: boolean;
}

export interface UserRole {
    titre: string,
    permissions: string,
    suppression: string,
    id: number
}

export interface UserRoleCreate {
    titre: string,
    permissions: string,
    suppression: string,
}

export interface UserRoleUpdate {
    titre?: string,
    permissions?: string,
    suppression?: string,
}

export const permissionList = [
    "manage",
    "request",
    "ilots",
    "expositions",
    "elements",
    "stocks",
    "fiches",
    "systematiques",
    "historique",
    "users"
]

export const suppressionList = [
    "ilots",
    "expositions",
    "elements",
    "stocks",
    "fiches",
    "systematiques",
    "historique",
    "users"
]

export interface UserGroup {
    nom: string,
    id: number
}

export const getUserFullName = (user: User) => user.prenom + ' ' + user.nom