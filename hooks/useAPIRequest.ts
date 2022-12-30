import { MySession } from "@conf/utility-types";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from "axios";
import { apiURL, apiURLs } from "conf/api/conf";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router"
import { isAuthError } from "utils/req-utils";
import useLogOut from "./useLogOut";


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
        showPageOn404?: boolean
    ) => {
        const baseURL = `${apiURL}${apiURLs[itemType]}${additionalPath ? additionalPath : ""}`;

        if(status != "authenticated") { 
            useLogOut() 
            return 
        }

        const handleFailure = (error: Error | AxiosError) => {
            if(axios.isAxiosError(error)) {
                if(error.response) {
                    // in case the user's token has expired
                    // log out
                    if(isAuthError(error)) {
                        useLogOut()
                    } else if(error.response.status == 404 && showPageOn404) {
                        // redirect to the 404 page
                        // todo: make 404 page
                        router.push('/404')
                    }
                }
            }
            console.log(error)
            if(typeof onFailure !== "undefined") {
                return onFailure(error)
            }
        }

        const handleSuccess = (res: AxiosResponse<T>) => {
            if(typeof onSuccess !== "undefined") {
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