
import Button from "@components/button";
import { defaultSearchItem, itemTypes, searchConf } from "@conf/api/search";
import { faSearch } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import styles from "@styles/components/form-elements/search-bar.module.scss"
import { useRouter } from "next/router";
import { useEffect, useState } from "react"
import Select, { OnSelectHandler } from "@components/form-elements/select";

interface Props {
    itemType?: string;
    hideSelect?: boolean;
    hideCTA?: boolean;
    onItemTypeUpdate?: (itemType: string) => any
}

const SearchBar = (
    {
        itemType = defaultSearchItem,
        hideSelect,
        hideCTA,
        onItemTypeUpdate
    }: Props
    ) => {

    const placeholder = "Rechercher"

    // keep the "default param name" up to date, which is the name for the text input value
    // used in the search query that's passed to the search page
    // it needs to be updated when the item type changes 
    // because it should always correspond to it


    const [defaultParamName, setDefaultParamName] = useState(searchConf[itemType].defaultSearchParam)

    useEffect(() => {
        setDefaultParamName(searchConf[itemType].defaultSearchParam)
    }, [itemType])


    // notify the parent component when the item type changes

    const handleItemTypeChange: OnSelectHandler = newItemType => {
        onItemTypeUpdate && onItemTypeUpdate(newItemType as string);
    }
    
    // submit

    const router = useRouter()

    const handleSubmit = () => {
        // todo
        router.push('/search')
    }

    // submit on enter

    useEffect(() => {
        // we add an event listener that will run the handleSubmit function
        // when the user hits 'enter'
        const listener = (event: KeyboardEvent) => {
            if(event.code == "Enter" || event.code == "NumpadEnter") {
                event.preventDefault()
                handleSubmit()
            }
        }
        // add this listener to our search bar ONLY
        const searchBar = document.getElementById(styles.searchBarContainer)
        searchBar?.addEventListener("keydown", listener)
        // remove the listener on cleanup
        return () => {
            searchBar?.removeEventListener("keydown", listener)
        }
    }, [])

    // render

    return (
        <div id={styles.searchBarContainer}>
            <FontAwesomeIcon className={styles.icon} icon={faSearch}/>
            <input 
                type="text" 
                name={defaultParamName}
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
                value={itemType}
            />
            {/* submit button */}
            <Button
                onClick={handleSubmit}
                hidden={hideCTA}>
                Rechercher
            </Button>
        </div>
    )
}

export default SearchBar