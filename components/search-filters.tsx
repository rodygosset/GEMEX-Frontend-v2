
import { apiURLs } from "@conf/api/conf"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import styles from "@styles/components/search-filters.module.scss"
import { Context } from "@utils/context"
import { toSearchFiltersObject, toURLQuery } from "@utils/search-utils"
import React, { FormEventHandler, useContext, useEffect, useState } from "react"
import Button from "./button"
import BooleanFilter from "./search-filters/boolean-filter"
import DateFilter from "./search-filters/date-filter"
import MultiSelectFilter from "./search-filters/multi-select-filter"
import NumericFilter from "./search-filters/numeric-filter"
import SelectFilter from "./search-filters/select-filter"
import TextFilter from "./search-filters/text-filter"
import TimeDeltaFilter from "./search-filters/time-delta-filter"
import VerticalScrollBar from "./utils/vertical-scrollbar"

interface Props {
    className?: string;
    hidden?: boolean;
    onSubmit?: () => void;
}

// this component provided a GUI for the user to make queries on the database
// it only displays filters corresponding to the type of item being queried
// and updates the search context on each user interaction

const SearchFilters = (
    {
        className,
        hidden,
        onSubmit
    }: Props
) => {

    const { searchParams, setSearchParams } = useContext(Context)

    // state 

    const [searchFilters, setSearchFilters] = useState(toSearchFiltersObject(searchParams["item"]?.toString(), searchParams))

    // update the filters depending on the item type

    useEffect(() => setSearchFilters(toSearchFiltersObject(searchParams["item"]?.toString(), searchParams)), [searchParams["item"]])

    // update the search params when the filters change

    useEffect(() => {
        // avoid "can't access property of undefined" errors :(
        if(!searchParams["item"]) return
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
        let classNames = ""
        classNames += className ? className : ''
        classNames += hidden ? ' ' + styles.hidden : ''
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
        if(newSearchFilters[filterName].conf.type == "date") {
            console.log("date checked ?", filterName, checked)
        }
    }


    const handleSubmit: FormEventHandler = e => {
        e.preventDefault()
        if(onSubmit) {
            onSubmit()
        } 
    }
    return (
        <section className={getClassNames()} id={styles.container}>
            <h4>Paramètres de recherche</h4>
            <VerticalScrollBar className={styles.filtersContainer}>
                {
                    // Generate the form
                    // for each SearchFilter
                    // render a component according to its type
                    Object.keys(searchFilters).map(filterName => {
                        const filter = searchFilters[filterName]
                        const { conf } = filter

                        // DRY
                        const filterProps = {
                            name: filterName,
                            filter: filter,
                            onChange: handleFilterValueChange,
                            onToggle: handleFilterCheckedToggle
                        }

                        switch(conf.type) {
                            case "text":
                                // text input
                                return (
                                    <TextFilter
                                        key={filterName}
                                        {...filterProps}
                                    />
                                )
                            case "boolean":
                                // checkbox
                                return (
                                    <BooleanFilter
                                        key={filterName}
                                        {...filterProps}
                                    />
                                )
                            case "number":
                                // numeric input
                                return (
                                    <NumericFilter
                                        key={filterName}
                                        {...filterProps}
                                    />
                                )
                            case "date":
                                // date input
                                return (
                                    <DateFilter
                                        key={filterName}
                                        {...filterProps}
                                    />
                                )
                            case "timeDelta":
                                // filter representing an amount of time
                                return (
                                    <TimeDeltaFilter
                                        key={filterName}
                                        {...filterProps}
                                    />
                                )
                            case "itemList": 
                                // multi select
                                if(!conf.item || !(conf.item in apiURLs)) { break }
                                return (
                                    <MultiSelectFilter
                                        key={filterName}
                                        {...filterProps}
                                    />
                                )
                            default:
                                // select
                                if(!(conf.type in apiURLs)) { break }
                                return (
                                    <SelectFilter
                                        key={filterName}
                                        {...filterProps}
                                    />
                                )    
                        }
                    })
                }
            </VerticalScrollBar>
            {/* Submit button */}
            <Button 
                onClick={handleSubmit}
                className={styles.submitButton}
                fullWidth
                bigPadding
                type="submit"
                icon={faMagnifyingGlass}>
                Rechercher
            </Button>
        </section>
    )
}

export default SearchFilters