import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, CancelToken, CancelTokenSource } from "axios";
import { apiURL, apiURLs } from "conf/api/conf";
import { DefaultSession } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router"
import useLogOut from "./useLogOut";

interface MySession extends DefaultSession {
    access_token: string;
}


export type APIRequestFunction = <T, U>(
    verb: "get" | "post" | "put" | "delete", 
    itemType: string, 
    additionalPath?: string, 
    data?: any, 
    onSuccess?: (res: AxiosResponse<T>) => U, 
    onFailure?: (error: Error | AxiosError) => U, 
    cancelToken?: CancelTokenSource,
    showPageOn404?: boolean,
    notifyUser?: boolean
) => Promise<U>

const useAPIRequest = () => {

    const router = useRouter()

    const { data, status } = useSession()

    const session = (data as MySession)

    const makeAPIRequest = <T, U>(
        verb: "get" | "post" | "put" | "delete",
        itemType: string, 
        additionalPath?: string,
        data?: any,
        onSuccess?: (res: AxiosResponse<T>) => U,
        onFailure?: (error: Error | AxiosError) => U,
        cancelToken?: CancelTokenSource,
        showPageOn404?: boolean,
        notifyUser?: boolean
    ) => {
        const baseURL = `${apiURL}${apiURLs[itemType]}${additionalPath ? additionalPath : ""}`;

        if(status != "authenticated") { 
            useLogOut() 
            return 
        }

        const handleFailure = (error: Error | AxiosError) => {
            // if(axios.isAxiosError(error)) {
            //     const errorMessage = error.message;
            //     if(error.response) {
            //         if(error.response.status === 401) { logOut(); return }
            //         if(!showPageOn404 && notifyUser) {
            //             utils.notifyUser(`Erreur ${error.response.status} : ${errorMessage}`)
            //         }
            //     }
            // } else {
            //     console.log(error);
            // }
            console.log(error)
            if(showPageOn404) {
                router.push('/404')
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

        if(typeof cancelToken !== "undefined") {
            reqConfig["cancelToken"] = cancelToken.token
        }

        
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

    return makeAPIRequest

}

export default useAPIRequest