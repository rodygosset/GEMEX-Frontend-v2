import axios from "axios"
import { apiURL } from "conf/api/conf"
import { AuthOptions } from "next-auth"
import NextAuth from "next-auth/next"

import FormData from 'form-data'

import CredentialsProvider from "next-auth/providers/credentials"


export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
        // The name to display on the sign in form (e.g. 'Sign in with...')
        name: 'Credentials',
        // The credentials is used to generate a suitable form on the sign in page.
        // You can specify whatever fields you are expecting to be submitted.
        // e.g. domain, username, password, 2FA token, etc.
        // You can pass any HTML attribute to the <input> tag through the object.
        credentials: {
            username: { label: "Nom d'utilisateur", type: "text", placeholder: "Entrez votre nom d'utilisateur" },
            password: {  label: "Matricule", type: "password" }
        },
        async authorize(credentials: any) { 

            // build the form data 
            const formData = new FormData()
            formData.append('username', credentials.username)
            formData.append('password', credentials.password)

            // send the credentials to the API login endpoint
            
            const res = await axios.post(`${apiURL}/token/`, formData)
    
            // If no error and we have the JWT, return the access token
            if (res.status == 200) {
                // get user data
                const { data: userData } = await axios.get(`${apiURL}/api/users/me`, {
                    headers: {
                        Authorization: `bearer ${res.data.access_token}` 
                    }
                })
                // return the access token along with user data
                return {
                    access_token: res.data.access_token,
                    ...userData 
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
                token = { access_token: user.access_token }
                // @ts-ignore
                delete user.access_token
                token.user = user
            }
            return token
        },
        async session({ session, token })  {
            // @ts-ignore
            session.access_token = token.access_token
            // @ts-ignore
            session.user = token.user
            return session
        }
    },

    debug: true
}

export default NextAuth(authOptions)
