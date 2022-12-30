import { DefaultSession } from "next-auth";

export interface MySession extends DefaultSession {
    access_token: string;
}
