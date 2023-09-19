import axios from "axios"
import { dockerAPIURL } from "@conf/api/conf"
import { AuthOptions } from "next-auth"
import NextAuth from "next-auth/next"

import FormData from 'form-data'

import CredentialsProvider from "next-auth/providers/credentials"
import { User, UserRole } from "@conf/api/data-types/user"


export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
        id: 'credentials',
        // The name to display on the sign in form (e.g. 'Sign in with...')
        name: 'Credentials',
        // @ts-ignore
        async authorize(credentials: any) { 

            // build the form data 
            const formData = new FormData()
            formData.append('username', credentials.username)
            formData.append('password', credentials.password)

            // send the credentials to the API login endpoint
            
            const res = await axios.post(`${dockerAPIURL}/token/`, formData)
    
            // If no error and we have the JWT, return the access token
            if (res.status == 200) {
                // get user data
                const { data: userData } = await axios.get<User>(`${dockerAPIURL}/api/users/me`, {
                    headers: {
                        Authorization: `bearer ${res.data.access_token}` 
                    }
                })
                // get user role
                const { data: userRole } = await axios.get<UserRole>(`${dockerAPIURL}/api/users/roles/id/${userData.role_id}`, {
                    headers: {
                        Authorization: `bearer ${res.data.access_token}` 
                    }
                })
                // return the access token along with user data
                return {
                    access_token: res.data.access_token,
                    ...userData,
                    role: userRole 
                }

            }
            // Return null if user data could not be retrieved
            return null
        }
        })
    ],
    
    session: {
        strategy: 'jwt'
    },

    pages: {
        signIn: "/login"
    },

    callbacks: {
        async jwt({ token, user }) {
            if(user) {
                // @ts-ignore
                token = { access_token: user.access_token, userRole: user.role }
                // @ts-ignore
                delete user.access_token
                // @ts-ignore
                delete user.role
                token.user = user
            }
            return token
        },
        async session({ session, token })  {
            // @ts-ignore
            session.access_token = token.access_token
            // @ts-ignore
            session.user = token.user
            // @ts-ignore
            session.userRole = token.userRole
            return session
        }
    },

    debug: true
}

export default NextAuth(authOptions)
