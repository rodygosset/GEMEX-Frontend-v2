import BooleanFilter from "@components/search-filters/boolean-filter";
import DateFilter from "@components/search-filters/date-filter";
import MultiSelectFilter from "@components/search-filters/multi-select-filter";
import NumericFilter from "@components/search-filters/numeric-filter";
import SelectFilter from "@components/search-filters/select-filter";
import TextFilter from "@components/search-filters/text-filter";
import TimeDeltaFilter from "@components/search-filters/time-delta-filter";
import { apiURLs } from "@conf/api/conf";
import { Context } from "@utils/context";
import { defaultOperator, hasNumberOperatorParam } from "@utils/form-elements/time-delta-input";
import { toSearchFiltersObject, toURLQuery } from "@utils/search-utils";
import { useContext, useEffect, useState } from "react";
import { ScrollArea } from "./scroll-area";

interface Props {
    className?: string;
    clearTrigger?: number;
}

const SearchFilters = (
    {
        className,
        clearTrigger
    }: Props
) => {

    const { searchParams, setSearchParams } = useContext(Context)

    // state 

    const [searchFilters, setSearchFilters] = useState(toSearchFiltersObject(searchParams["item"]?.toString(), searchParams))

    // update the filters depending on the item type

    useEffect(() => setSearchFilters(toSearchFiltersObject(searchParams["item"]?.toString(), searchParams)), [searchParams["item"]])

    // clear the filters when the clearTrigger changes

    useEffect(() => {
        if(!(typeof clearTrigger === "number") || clearTrigger == 0) return

        setSearchFilters(toSearchFiltersObject(searchParams["item"]?.toString(), {}))
        setSearchParams({ item: searchParams["item"] })

    }, [clearTrigger])

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




    // render

    return (
        <ScrollArea className="w-full max-h-[450px] min-h-0 flex flex-col">
        <div className="flex flex-col gap-[24px] w-full flex-1 min-h-0">
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
        </div>
        </ScrollArea>
    )
}

export default SearchFilters