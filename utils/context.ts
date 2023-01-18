import React from "react"

// set up the app context, which is mainly the search context
// which allows the search bar & the search filters to share data

export interface SearchParamsType {
    [prop: string]: string | number;
}

export interface SearchContext {
    searchParams: SearchParamsType;
    setSearchParams: (newSearchParams: SearchParamsType) => void
}

export const searchContext: SearchContext = {
    searchParams: {},
    setSearchParams: () => {}
}

export const Context = React.createContext(searchContext)