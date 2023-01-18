
import Button from "@components/button"
import { defaultSearchItem, itemTypes, searchConf } from "@conf/api/search"
import { faSearch, faSliders } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/components/form-elements/search-bar.module.scss"
import { useRouter } from "next/router"
import { ChangeEventHandler, KeyboardEventHandler, useEffect, useRef, useState } from "react"
import Select, { OnSelectHandler } from "@components/form-elements/select"
import SearchFilters from "@components/search-filters"

interface Props {
    defaultValue?: string;
    itemType?: string;
    hideSelect?: boolean;
    hideCTA?: boolean;
    showFilters?: boolean;
    fullWidth?: boolean;
    onItemTypeChange?: (newItemType: string) => void,
    onInputChange?: (newInputValue: string) => void,
    onSubmit?: () => void
}

const SearchBar = (
    {
        defaultValue,
        itemType = defaultSearchItem,
        hideSelect,
        hideCTA,
        showFilters = false,
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


    // keep the "default param name" up to date, which is the name for the text input value
    // used in the search query that's passed to the search page
    // it needs to be updated when the item type changes 
    // because it should always correspond to it


    const [defaultParamName, setDefaultParamName] = useState(searchConf[itemType].defaultSearchParam)

    useEffect(() => {
        setDefaultParamName(searchConf[itemType].defaultSearchParam)
    }, [itemType])
    
    // submit
    // if provided, run the handler provided by the parent
    // otherwise, go to the search page

    const router = useRouter()

    const handleSubmit: KeyboardEventHandler = e => {
        e.preventDefault()
        if(onSubmit) {
            onSubmit()
        } else { 
            router.push({
                pathname: "/search",
                query: {
                    item: searchItemType,
                    [defaultParamName]: query
                }
            })
        }
    }

    // submit on enter

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = e => {
        if(e.code == "Enter" || e.code == "NumpadEnter") {
            handleSubmit(e)
        }
    }

    const getClassName = () => {
        return fullWidth ? styles.fullWidth : ''
    }

    // manage search filters visibility

    const [showDropdown, setShowDropdown] = useState(false)

    const toggleFiltersVisibilty = () => setShowDropdown(!showDropdown)

    // close the dropdown when user clicks outside out of it

    const buttonRef = useRef(null)

    const dropdownRef = useRef(null)

    const closeIfClickOutside = (event: MouseEvent) => {
        // @ts-ignore
        if(buttonRef.current && buttonRef.current.contains(event.target)) return
        // @ts-ignore
        if(dropdownRef.current && showDropdown && !dropdownRef.current.contains(event.target)) {
            setShowDropdown(false)
        }
    }

    document.addEventListener('mousedown', closeIfClickOutside)

    // render

    return (
        <div id={styles.searchBarContainer} className={getClassName()}>
            <FontAwesomeIcon className={styles.icon} icon={faSearch}/>
            <input 
                type="text" 
                name={defaultParamName}
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                id={styles.textInput} 
                placeholder={placeholder}
            />
            {/* item type select */}
            <Select 
                name="itemType"
                options={itemTypes}
                hidden={hideSelect}
                onChange={handleItemTypeChange}
                isSearchable={false}
                value={searchItemType}
            />
            {/* search filters */}
            <Button
                onClick={toggleFiltersVisibilty}
                icon={faSliders}
                hidden={!showFilters}>
                Filtres
            </Button>
            {/* submit button */}
            <Button
                ref={buttonRef}
                onClick={handleSubmit}
                hidden={hideCTA}>
                Rechercher
            </Button>
            {
                showDropdown ?
                <SearchFilters
                    ref={dropdownRef} 
                    className={styles.dropdownContainer}
                    onSubmit={onSubmit}
                />
                :
                <></>
            }
        </div>
    )
}

export default SearchBar