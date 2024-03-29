import React from "react"

// set up the app context, which is mainly the search context
// which allows the search bar & the search filters to share data

export interface SearchParamsType {
    [prop: string]: string | number;
}

export interface AppContext {
    searchParams: SearchParamsType;
    setSearchParams: (newSearchParams: SearchParamsType) => void;
    navHistory: string[];
    setNavHistory: (newNavHistory: string[]) => void;
    initSearchParamsLoaded: boolean;
    setInitSearchParamsLoaded: (newInitSearchParamsLoaded: boolean) => void;
}

export const searchContext: AppContext = {
    searchParams: {},
    setSearchParams: () => {},
    navHistory: [],
    setNavHistory: () => {},
    initSearchParamsLoaded: true,
    setInitSearchParamsLoaded: () => {},
}

export const Context = React.createContext(searchContext)