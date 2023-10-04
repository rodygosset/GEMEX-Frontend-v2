import { Session } from "next-auth";
import { User, UserRole } from "./api/data-types/user";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

// @ts-ignore
export interface MySession extends Session {
    access_token: string;
    user: User;
    userRole: UserRole;
}

export interface FigureCardType {
    title: string;
    caption: string;
    value?: number;
    color: string; // tailwind gradient
    icon: IconProp;
    link: string;
}