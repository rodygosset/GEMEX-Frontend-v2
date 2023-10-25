// auth middleware
// used to make sure the user is logged in && the token is valid
// otherwise, redirect to login page

import { apiURL } from "@conf/api/conf"
import { UserRole } from "@conf/api/data-types/user"
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const routePermissions: { [key: string]: string } = {
	"user-management-dashboard": "manage",
	"availability-ratio-reports": "rapports",
	quality: "qualite"
}

/**
 * Check if the user has the permission to access the current page
 * @param userRole A user role object
 * @param path The path of the current page
 * @returns A boolean indicating if the user has the permission to access the current page
 */
const userHasPermission = (userRole: UserRole, path: string) => {
	const rootPath = path.split("/")[1]
	// check if the current page is a page that requires a specific permission
	if (routePermissions[rootPath]) {
		// check if the user has the correct permission
		return userRole.permissions.includes(routePermissions[rootPath])
	}
	if (rootPath == "create" || rootPath == "edit") {
		// check if the user has the correct permission
		const item = path.split("/")[2]
		return userRole.permissions.includes(item)
	}
	// show the current page
	return true
}

export default withAuth(
	(req) => {
		// if there is no token
		if (!req.nextauth?.token) {
			// redirect to the login page
			const newUrl = req.nextUrl.clone()
			newUrl.pathname = "/login"
			return NextResponse.redirect(newUrl)
		}
		// get the user's role from the token
		const userRole = req.nextauth.token.userRole as UserRole
		// if the user's trying to access a page he doesn't have the permission to access
		if (!userHasPermission(userRole, req.nextUrl.pathname)) {
			// redirect to the 404 page
			const newUrl = req.nextUrl.clone()
			newUrl.pathname = "/404"
			return NextResponse.redirect(newUrl)
		}
	},
	{
		pages: {
			signIn: "/login"
		},
		callbacks: {
			async authorized({ token }) {
				if (!token) return false
				// try to get data from an authenticated API route
				// using our session access token
				try {
					const response = await fetch(`${apiURL}/hello/`, {
						headers: { Authorization: `bearer ${token.access_token}` }
					})
					// if the request succeeds
					return response.status == 200
				} catch (error) {
					console.log(`Error while sending a request to the API -- ${apiURL}`, error)
					return false
				}
			}
		}
	}
)

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public (other static files)
		 */
		"/((?!api|_next/static|_next/image|login|favicon.ico|favicon/|images/|404).*)"
	]
}
