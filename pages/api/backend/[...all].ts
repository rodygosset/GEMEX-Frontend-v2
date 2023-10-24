import { apiURL } from "@conf/api/conf"
import { createProxyMiddleware } from "http-proxy-middleware"
import { NextApiRequest, NextApiResponse } from "next"

const proxy = createProxyMiddleware({
	target: apiURL,
	changeOrigin: true,
	pathRewrite: {
		"^/api/backend": "/api"
	},
	logLevel: "silent",
	secure: false
})

// Make sure that we don't parse JSON bodies on this route:
export const config = {
	api: {
		externalResolver: true,
		bodyParser: false
	}
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	// if the request is for a file (extension in the url)
	if (req.url?.includes(".") && req.url?.includes("/api/backend/fichiers/") && req.method === "GET") {
		// get the filename from the url
		const filename = req.url.split("/").pop()
		// make a request to the backend for the file
		// then send it back to the client using the Response object
		console.log("fetching file from backend -- ", filename)
		const fileResponse = await fetch(`${apiURL}/api/fichiers/${filename}/`)
		const fileBlob = await fileResponse.blob()
		const bufferArray = await fileBlob.arrayBuffer()
		const buffer = Buffer.from(bufferArray)
		if (!fileResponse.ok) throw new Error(`Error fetching file from backend: ${fileResponse.statusText}`)
		console.log("file fetched from backend -- ", fileBlob.type, fileBlob.size)
		res.setHeader("Content-Type", fileBlob.type)
		res.setHeader("Content-Disposition", `attachment; filename=${filename}`)
		res.setHeader("Content-Length", fileBlob.size)
		res.write(buffer, "binary")
		res.status(200)
		return
	}
	// if it is a DELETE request, instead of proxying it, we make a request to the backend directly
	// and then send the response back to the client
	if (req.method === "DELETE") {
		// keep everything after "/api/backend" in the url
		const backendRoute = `${apiURL}/api${req.url?.split("/api/backend").pop()}`
		const backendResponse = await fetch(`${backendRoute}`, {
			method: "DELETE",
			headers: {
				Authorization: req.headers.authorization ?? ""
			}
		})
		const backendResponseJson = await backendResponse.json()
		res.status(backendResponse.status)
		res.json(backendResponseJson)
		return
	}
	// @ts-ignore
	return proxy(req, res, (err) => {
		if (err instanceof Error) {
			throw err
		}

		throw new Error(`Request '${req.url}' is not proxied! We should never reach here!`)
	})
}

export default handler
