import { apiURL } from "@conf/api/conf"
import { MySession } from "@conf/utility-types"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	// make sure the "route" parameter is provided in the query string

	const { route } = req.query

	if (!route) {
		res.status(400).json({ message: "`route` parameter required" })
		return
	}

	// get the auth token from the next-auth session

	const session = (await getSession({ req })) as MySession | null

	const token = session?.access_token

	// forward the request to our FastAPI backend

	const url = `${apiURL}${route}`

	const response = await fetch(url, {
		method: req.method,
		headers: {
			// include the token if it exists
			...(token && { Authorization: `bearer ${token}` }),
			"Content-Type": "application/json"
		},
		// only include the body if it exists & the request is not a GET request
		body: req.method != "GET" && req.body ? JSON.stringify(req.body) : undefined
	})

	// return the response from the FastAPI backend

	res.status(response.status).json(await response.json())
}

export default handler
