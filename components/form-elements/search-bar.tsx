
import Button from "@components/button"
import { defaultSearchItem, itemTypes, searchConf } from "@conf/api/search"
import { faSearch, faSliders } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/components/form-elements/search-bar.module.scss"
import { useRouter } from "next/router"
import { ChangeEventHandler, KeyboardEventHandler, useEffect, useState } from "react"
import Select, { OnSelectHandler } from "@components/form-elements/select"
import { DynamicObject } from "@utils/types"
import SearchFilters from "@components/search-filters"

interface Props {
    className?: string;
    defaultValue?: string;
    itemType?: string;
    hiddenItemTypes?: string[];
    hideSelect?: boolean;
    hideCTA?: boolean;
    showFiltersButton?: boolean;
    embedFilters?: boolean;
    onFiltersToggle?: () => void;
    fullWidth?: boolean;
    onItemTypeChange?: (newItemType: string) => void,
    onInputChange?: (newInputValue: string) => void,
    onSubmit?: () => void
}

const SearchBar = (
    {
        className,
        defaultValue,
        itemType = defaultSearchItem,
        hiddenItemTypes,
        hideSelect,
        hideCTA,
        showFiltersButton = false,
        embedFilters = false,
        onFiltersToggle,
        fullWidth,
        onItemTypeChange,
        onInputChange,
        onSubmit
    }: Props
    ) => {

    const placeholder = "Rechercher"

    // input state & effects

    const [query, setQuery] = useState(defaultValue ? defaultValue : '')

    const handleInputChange: ChangeEventHandler<HTMLInputElement> = event => {
        event.preventDefault()
        setQuery(event.target.value)
    }

    // keep the parent component updated with the latest value of the text input

    useEffect(() => {
        if(onInputChange) {
            onInputChange(query)
        } 
    }, [query])


    
    // keep the item type value in state
    // so we can use it in the submit handler

    const [searchItemType, setSearchItemType] = useState(itemType)

    // notify the parent component when the item type changes
    // && update the state variable

    const handleItemTypeChange: OnSelectHandler = newItemType => {
        setSearchItemType(newItemType as string)
        if(onItemTypeChange) {
            onItemTypeChange(newItemType as string)
        }
    }

    // filter the itemTypes array to remove the item types that are hidden

    const getItemTypes = () => {
        if(!hiddenItemTypes) return itemTypes
        return itemTypes.filter(type => !hiddenItemTypes.includes(type.value))
    }


    // keep the "default param name" up to date, which is the name for the text input value
    // used in the search query that's passed to the search page
    // it needs to be updated when the item type changes 
    // because it should always correspond to it


    const [defaultParamName, setDefaultParamName] = useState(searchConf[itemType].defaultSearchParam)

    useEffect(() => {
        setDefaultParamName(searchConf[itemType].defaultSearchParam)
    }, [itemType])

    // build the default URL query

    const buildURLQuery = () => {
        let baseURLQuery: DynamicObject = { item: searchItemType }
        // don't include the text input value
        // if it's empty
        if(query) {
            baseURLQuery[defaultParamName] = query
        }
        // if the current item type accepts the "is_active" param
        // set it to true by default
        if("is_active" in searchConf[searchItemType].searchParams) {
            baseURLQuery["is_active"] = true
        }
        return baseURLQuery
    }

    // submit
    // if provided, run the handler provided by the parent
    // otherwise, go to the search page

    const router = useRouter()

    const handleSubmit: KeyboardEventHandler = e => {
        e.preventDefault()
        if(onSubmit) {
            onSubmit()
        } else { 
            // submit query to the search page
            router.push({
                pathname: "/search",
                query: buildURLQuery()
            })
        }
    }

    // submit on enter

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = e => {
        if(e.code == "Enter" || e.code == "NumpadEnter") {
            handleSubmit(e)
        }
    }

    const getClassNames = () => {
        let classNames = "" 
        classNames += fullWidth ? styles.fullWidth : ''
        classNames += className ? ' ' + className : ''
        return classNames
    }

    // manage search filters visibility
    
    const [showFilters, setShowFilters] = useState(false)

    const toggleFiltersVisibilty = () => {
        if(onFiltersToggle) onFiltersToggle()
        else {
            setShowFilters(!showFilters)
        }
    }

    // input conf

    const maxLength = 50

    // render

    return (
        <form 
            name="search-bar"
            id={styles.searchBarContainer} 
            className={getClassNames()}
            onSubmit={() => handleSubmit}>
            <FontAwesomeIcon className={styles.icon} icon={faSearch}/>
            <input 
                type="text" 
                name={defaultParamName}
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                id={styles.textInput} 
                placeholder={placeholder}
                maxLength={maxLength}
            />
            {/* item type select */}
            <Select 
                name="itemType"
                options={getItemTypes()}
                hidden={hideSelect}
                onChange={handleItemTypeChange}
                isSearchable={false}
                value={searchItemType}
            />
            {/* search filters */}
            <Button
                onClick={toggleFiltersVisibilty}
                icon={faSliders}
                hidden={!showFiltersButton}>
                Filtres
            </Button>
            {/* submit button */}
            <Button
                onClick={handleSubmit}
                hidden={hideCTA}>
                Rechercher
            </Button>
            {
                // in case the user wants to embed the filters
                embedFilters ?
                <SearchFilters 
                    className={styles.embeddedFilters} 
                    hidden={!showFilters} 
                    hideSearchButton 
                    isForm={false}
                />
                :
                <></>
            }
        </form>
    )
}

export default SearchBar