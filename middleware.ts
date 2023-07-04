

// auth middleware
// used to make sure the user is logged in && the token is valid
// otherwise, redirect to login page

import { apiURL } from '@conf/api/conf'
import { withAuth } from 'next-auth/middleware'

export default withAuth({
	pages: {
		signIn: '/login'
	},
	callbacks: {
		async authorized({ token }) {
			if(!token) return false
			// try to get data from an authenticated API route
            // using our session access token
			try {
				const response = await fetch(`${apiURL}/hello/`, {
					headers: { Authorization: `bearer ${token.access_token}` }
				})
				// if the request succeeds
				// show the current page
				return response.status == 200
			} catch (error) {
				console.log("Error while sending a request to the API", error)
				return false
			}
		}
	}
})


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
		'/((?!api|_next/static|_next/image|favicon.ico|favicon/|images/).*)',
	],
}