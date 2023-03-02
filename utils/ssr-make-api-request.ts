import { MySession } from "@conf/utility-types"
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios"
import { dockerAPIURL, apiURLs } from "conf/api/conf"


export interface SSRAPIRequestArgs<T,U> {
    session: MySession,
    verb: "get" | "post" | "put" | "delete", 
    itemType: string, 
    additionalPath?: string, 
    data?: any, 
    onSuccess?: (res: AxiosResponse<T>) => U, 
    onFailure?: (error: Error | AxiosError) => U | void,
    abortSignal?: AbortSignal, 
    showPageOn404?: boolean,
    notifyUser?: boolean
}


export type SSRAPIRequestFunction = <T, U>(
    args: SSRAPIRequestArgs<T,U>
) => Promise<U | undefined>

const SSRmakeAPIRequest = async <T, U>(
    {
        session,
        verb,
        itemType,
        additionalPath,
        data,
        onSuccess,
        onFailure,
        abortSignal
    }: SSRAPIRequestArgs<T,U>
) => {

    const baseURL = `${dockerAPIURL}${apiURLs[itemType]}${additionalPath ? additionalPath : ""}`;

    if(!session) { 
        return
    }

    const handleFailure = (error: Error | AxiosError) => {
        if(axios.isAxiosError(error)) {
            const errorMessage = error.message;
            if(error.response) {
                console.log(`Erreur ${error.response.status} : ${errorMessage}`)
            }
        }
        if(typeof onFailure !== "undefined") {
            return onFailure(error)
        }
    }

    const handleSuccess = (res: AxiosResponse<T>) => {
        if(typeof onSuccess !== "undefined") {
            // console.log("result has arrived")
            return onSuccess(res)
        }
    }

    let reqConfig: AxiosRequestConfig = {
        headers: {
            Authorization: `bearer ${session.access_token}`
        }
    }

    if(typeof abortSignal != "undefined") reqConfig.signal = abortSignal
    
    const reqData = data ? data : {}
    

    switch(verb) {
        case "get":
            return axios.get<T>(baseURL, reqConfig)
            .then(handleSuccess)
            .catch(handleFailure)
            // break
        case "post":
            return axios.post<T>(baseURL, reqData, reqConfig)
            .then(handleSuccess)
            .catch(handleFailure)
            // break
        case "put":
            return axios.put<T>(baseURL, reqData, reqConfig)
            .then(handleSuccess)
            .catch(handleFailure)
            // break
        case "delete":
            return  axios.delete<T>(baseURL, reqConfig)
            .then(handleSuccess)
            .catch(handleFailure)
            // break
    }
}

export default SSRmakeAPIRequest