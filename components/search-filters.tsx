
import { apiURLs } from "@conf/api/conf"
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import styles from "@styles/components/search-filters.module.scss"
import { Context } from "@utils/context"
import { defaultOperator, hasNumberOperatorParam } from "@utils/form-elements/time-delta-input"
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
import { ScrollArea } from "./radix/scroll-area"

interface Props {
    className?: string;
    hidden?: boolean;
    hideSearchButton?: boolean;
    isForm?: boolean;
    onSubmit?: () => void;
}

// this component provided a GUI for the user to make queries on the database
// it only displays filters corresponding to the type of item being queried
// and updates the search context on each user interaction

const SearchFilters = (
    {
        className,
        hideSearchButton,
        hidden,
        isForm = true,
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
        console.log("search filters changed", searchFilters)
        // avoid "can't access property of undefined" errors :(
        if(!searchParams["item"]) return
        // get new URL query
        const newURLQuery = toURLQuery(searchFilters, searchParams, searchParams["item"].toString())
        
        // only update when the values have changed
        const shouldUpdate = JSON.stringify(newURLQuery) !== JSON.stringify(searchParams)
        if(shouldUpdate) {
            setSearchParams({ ...newURLQuery })
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
    }

    // utils for time delta & number inputs

    const getOperatorValue = (filterName: string) => {
        // fool-proofing
        if(!hasNumberOperatorParam(filterName, searchParams["item"]?.toString())) return defaultOperator
        return searchFilters[filterName + '_operator'].value
    }

    const setOperatorValue = (filterName: string, operatorValue: string) => {
        if(!hasNumberOperatorParam(filterName, searchParams["item"]?.toString())) return
        handleFilterValueChange(filterName + "_operator", operatorValue)
    }


    const handleSubmit: FormEventHandler = e => {
        e.preventDefault()
        if(onSubmit) {
            onSubmit()
        } 
    }

    // the rendering logic was extracted
    // to allow the option to render the search filters
    // inside a form, 
    // or inside a simple div
    // to avoid invalid dom nesting

    const renderFilters = () => {
        // Generate the form
        // for each SearchFilter
        // render a component according to its type
        return Object.keys(searchFilters).map(filterName => {
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
                            getOperatorValue={getOperatorValue}
                            setOperatorValue={setOperatorValue}
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
                            getOperatorValue={getOperatorValue}
                            setOperatorValue={setOperatorValue}
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

    const renderForm = () => {
        return (
            <>
                <ScrollArea className={styles.filtersContainer}>
                    {
                        // Generate the form
                        // for each SearchFilter
                        // render a component according to its type
                        renderFilters()
                    }
                </ScrollArea>
                {
                    !hideSearchButton ?
                    /* Submit button */
                    <Button 
                        onClick={handleSubmit}
                        className={styles.submitButton}
                        fullWidth
                        bigPadding
                        type="submit"
                        icon={faMagnifyingGlass}>
                        Rechercher
                    </Button>
                    :
                    <></>
                }
            </>
        )
    }

    return (
        <section className={getClassNames()} id={styles.container}>
            <h4>Paramètres de recherche</h4>
            {
                isForm ?
                <form onSubmit={ e => e.preventDefault() } name="search-filters">
                {
                    renderForm()
                } 
                </form>   
                :
                <div className={styles.searchFilters}>
                {
                    renderForm()
                }
                </div>
            }
        </section>
    )
}

export default SearchFilters