import { MySession } from "@conf/utility-types"
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios"
import { apiURLs } from "conf/api/conf"
import { signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { isAuthError } from "utils/req-utils"

export type APIRequestFunction = <T, U = T>(
	verb: "get" | "post" | "put" | "delete",
	itemType: string,
	additionalPath?: string,
	data?: any,
	onSuccess?: (res: AxiosResponse<T>) => U,
	onFailure?: (error: Error | AxiosError) => U | void,
	abortSignal?: AbortSignal,
	showPageOn404?: boolean,
	notifyUser?: boolean
) => Promise<U>

const useAPIRequest = () => {
	const router = useRouter()

	const makeAPIRequest = <T, U>(
		session: MySession,
		verb: "get" | "post" | "put" | "delete",
		itemType: string,
		additionalPath?: string,
		data?: any,
		onSuccess?: (res: AxiosResponse<T>) => U,
		onFailure?: (error: Error | AxiosError) => U,
		abortSignal?: AbortSignal,
		showPageOn404?: boolean
	) => {
		const baseURL = `${apiURLs[itemType]}${additionalPath ? additionalPath : ""}`

		if (status == "unauthenticated") {
			signOut({ callbackUrl: router.asPath })
			return
		}

		const handleFailure = (error: Error | AxiosError) => {
			if (axios.isAxiosError(error)) {
				if (error.response) {
					// in case the user's token has expired
					// log out
					if (isAuthError(error)) {
						signOut({ callbackUrl: router.asPath })
					} else if (error.response.status == 404 && showPageOn404) {
						// redirect to the 404 page
						router.push("/404")
					}
				}
			}
			if (typeof onFailure !== "undefined") {
				return onFailure(error)
			} else return error
		}

		const handleSuccess = (res: AxiosResponse<T>) => {
			if (typeof onSuccess !== "undefined") {
				return onSuccess(res)
			}
		}

		let reqConfig: AxiosRequestConfig = {
			headers: {
				Authorization: `bearer ${session.access_token}`
			}
		}

		if (typeof abortSignal != "undefined") reqConfig.signal = abortSignal

		const reqData = data ? data : {}

		switch (verb) {
			case "get":
				return axios.get<T>(baseURL, reqConfig).then(handleSuccess).catch(handleFailure)
			// break
			case "post":
				return axios.post<T>(baseURL, reqData, reqConfig).then(handleSuccess).catch(handleFailure)
			// break
			case "put":
				return axios.put<T>(baseURL, reqData, reqConfig).then(handleSuccess).catch(handleFailure)
			// break
			case "delete":
				return axios.delete<T>(baseURL, reqConfig).then(handleSuccess).catch(handleFailure)
			// break
		}
	}

	return makeAPIRequest
}

export default useAPIRequest
