
import { apiURLs } from "@conf/api/conf"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import styles from "@styles/components/search-filters.module.scss"
import { Context } from "@utils/context"
import { toSearchFiltersObject, toURLQuery } from "@utils/search-utils"
import React, { FormEventHandler, useContext, useEffect, useState } from "react"
import { LegacyRef } from "react"
import Button from "./button"
import SelectFilter from "./search-filters/select-filter"

interface Props {
    className?: string;
    onSubmit?: () => void;
}

// this component provided a GUI for the user to make queries on the database
// it only displays filters corresponding to the type of item being queried
// and updates the search context on each user interaction

const SearchFilters = (
    {
        className,
        onSubmit
    }: Props,
    ref: LegacyRef<HTMLElement>
) => {

    const { searchParams, setSearchParams } = useContext(Context)

    // state 

    const [searchFilters, setSearchFilters] = useState(toSearchFiltersObject(searchParams["item"].toString(), searchParams))


    // update the search params when the filters change

    useEffect(() => {
        // get new URL query
        const newURLQuery = toURLQuery(searchFilters, searchParams, searchParams["item"].toString())
        
        // only update when the values have changed
        const shouldUpdate = JSON.stringify(newURLQuery) !== JSON.stringify(searchParams)
        
        if(shouldUpdate) {
            setSearchParams(newURLQuery)
        }
    }, [searchFilters])

    // utils

    const getClassNames = () => {
        let classNames = styles.container
        classNames += className ? ' ' + className : ''
        return classNames
    }

    // handlers

    // handle updating the search filters's state from here
    // & pass these two functions to the filter components

    const handleFilterValueChange = (filterName: string, newValue: any) => {
        let newSearchFilters = { ...searchFilters }
        newSearchFilters[filterName].value = newValue
        setSearchFilters(newSearchFilters)
    }

    const handleFilterCheckedToggle = (filterName: string, checked: boolean) => {
        let newSearchFilters = { ...searchFilters }
        newSearchFilters[filterName].checked = checked
        setSearchFilters(newSearchFilters)
    }


    const handleSubmit: FormEventHandler = e => {
        e.preventDefault()
        if(onSubmit) {
            onSubmit()
        } 
    }
    return (
        <section className={getClassNames()} ref={ref}>
            <h4>Paramètres de recherche</h4>
            <div id={styles.filtersContainer}>
                {
                    // Generate the form
                    // for each SearchFilter
                    // render a component according to its type

                    Object.keys(searchFilters).map(filterName => {
                        const filter = searchFilters[filterName]
                        const { conf } = filter

                        switch(conf.type) {
                            default:
                                // select
                                if(!(conf.type in apiURLs)) { break }
                                return (
                                    <SelectFilter
                                        key={filterName}
                                        name={filterName}
                                        conf={conf}
                                        onChange={handleFilterValueChange}
                                        onToggle={handleFilterCheckedToggle}
                                    />
                                )    
                        }
                    })
                }
                {/* Submit button */}
                <Button 
                    onClick={handleSubmit}
                    fullWidth
                    bigPadding
                    type="submit"
                    icon={faMagnifyingGlass}>
                    Rechercher
                </Button>
            </div>
        </section>
    )
}

export default React.forwardRef<HTMLElement, Props>(SearchFilters)