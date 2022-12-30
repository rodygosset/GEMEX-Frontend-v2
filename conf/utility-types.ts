import { Session } from "next-auth";
import { User } from "./api/data-types/user";

// @ts-ignore
export interface MySession extends Session {
    access_token: string;
    user: User;
}
