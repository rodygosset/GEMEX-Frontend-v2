


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
    new_username?: string;
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
    "expositions",
    "elements",
    "stocks",
    "fiches",
    "systematiques",
    "historique",
    "users"
]

export const suppressionList = [
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
    users: string[],
    id: number
}

export interface UserGroupCreate {
    nom: string;
}

export interface UserGroupUpdate {
    new_nom: string;
}

export const getUserFullName = (user: User) => user.prenom + ' ' + user.nom