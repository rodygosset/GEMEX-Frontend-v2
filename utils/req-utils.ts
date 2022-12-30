import { isAxiosError } from "axios"


export const isAuthError = (data: any) => {
    if(!isAxiosError(data)) return false
    let is401 = data?.response?.status == 401
    let tokenIncorrect = data?.response?.data?.detail == "Impossible de valider les informations d'authentification."
    return is401 && tokenIncorrect
}