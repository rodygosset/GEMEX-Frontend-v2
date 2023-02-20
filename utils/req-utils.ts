import { MySession } from "@conf/utility-types"
import { isAxiosError } from "axios"
import SSRmakeAPIRequest from "./ssr-make-api-request"


export const isAuthError = (data: any) => {
    if(!isAxiosError(data)) return false
    let is401 = data?.response?.status == 401
    let tokenIncorrect = data?.response?.data?.detail == "Impossible de valider les informations d'authentification."
    return is401 && tokenIncorrect
}


export const getExtraSSRData = async (session: MySession, itemType: string, id: number) => {
    return await SSRmakeAPIRequest<any, string>({
        session: session as MySession,
        verb: "get",
        itemType: itemType,
        additionalPath: `id/${id}`, 
        onSuccess: res => res.data.nom,
        onFailure: error => {
            return "Erreur"
        }
    })
}