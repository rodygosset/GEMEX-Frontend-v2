import Button from "@components/button";
import ItemSelect from "@components/form-elements/item-select";
import ItemMultiSelect from "@components/form-elements/multi-select";
import SearchBar from "@components/form-elements/search-bar";
import Select from "@components/form-elements/select";
import RoleFormModal from "@components/modals/user-management/role-form-modal";
import UserFormModal from "@components/modals/user-management/user-form-modal";
import Pagination from "@components/pagination";
import { apiURLs } from "@conf/api/conf";
import { permissionList, suppressionList } from "@conf/api/data-types/user";
import { searchConf } from "@conf/api/search";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faList, faShieldHalved, faTableCellsLarge, faUserPlus, faUsers, faUserShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAPIRequest from "@hook/useAPIRequest";
import styles from "@styles/pages/user-management-dashboard.module.scss"
import { capitalizeFirstLetter } from "@utils/general";
import { useEffect, useRef, useState } from "react"

interface CategoryType {
    label: string;
    labelSingular: string;
    itemType: string;
    icon: IconProp;
    createIcon: IconProp;
    searchParams: string[];
    searchParamsData: {
        [key: string]: any;
    };
}

interface SearchParamsType {
    [key: string]: any;
}


const UserManagementDashboard = () => {

    // keep the 2 categories in an array

    const categories: CategoryType[] = [
        {
            label: "Utilisateurs",
            labelSingular: "utilisateur",
            itemType: "users",
            icon: faUsers,
            createIcon: faUserPlus,
            searchParams: [
                "role_id",
                "groups"
            ],
            searchParamsData: {}
        },
        {
            label: "Rôles",
            labelSingular: "rôle",
            itemType: "roles",
            icon: faShieldHalved,
            createIcon: faUserShield,
            searchParams: [
                "permissions",
                "suppression"
            ],
            searchParamsData: {
                permissions: permissionList.map(p => ({label: capitalizeFirstLetter(p), value: p})),
                suppression: suppressionList.map(s => ({label: capitalizeFirstLetter(s), value: s}))
            }
        }
    ]

    // state

    // trigger refresh of the search results

    const [refreshTrigger, setRefreshTrigger] = useState(false)

    const refresh = () => setRefreshTrigger(!refreshTrigger)

    // keep track of which category is selected

    const [selectedCategory, setSelectedCategory] = useState(categories[0])

    // search form data

    const [searchQ, setSearchQ] = useState("")

    const [searchParams, setSearchParams] = useState<SearchParamsType>({})

    // keep the search params in sync with the selected category

    useEffect(() => {
        const params: SearchParamsType = {}
        selectedCategory.searchParams.forEach(param => {
            let initVal 
            // get the conf for the current param
            const conf = searchConf[selectedCategory.itemType].searchParams[param]
            switch(conf.type) {
                case "itemList":
                    initVal = []
                    break
                default:
                    initVal = 0
                    break
            }
            params[param] = initVal
        })
        setSearchParams(params)
    }, [selectedCategory])

    // data fetching & pagination logic

    const makeAPIRequest = useAPIRequest()
    
    const [isLoading, setIsLoading] = useState(false)

    // we need to cancel on-going search requests
    // after a new one has been made
    // for that purpose, we use the native AbortController

    const reqController = useRef<AbortController>()

    const [currentPageNb, setCurrentPageNb] = useState(1)
    const [nbResults, setNbResults] = useState(0)
    const [totalPagesNb, setTotalPagesNb] = useState(1)

    // manage view mode (list or card)

    const [isListView, setIsListView] = useState<boolean>(true)

    // manage modals 

    const [showUserCreateForm, setShowUserCreateForm] = useState(false)

    const [showRoleCreateForm, setShowRoleCreateForm] = useState(false)

    // handlers

    const handleCategoryClick = (category: CategoryType) => setSelectedCategory(category)

    const handleSearchParamChange = (param: string, newVal: any) => {
        setSearchParams({
            ...searchParams,
            [param]: newVal
        })
    }

    // utils

    const getCategoryClassNames = (category: CategoryType) => {
        return category.label == selectedCategory.label ? styles.selected : ''
    }

    // compute which view mode button should show as the current selected view mode
    // & return the corresponding CSS class

    const getViewModeButtonClassName = (isListViewButton: boolean) => {
        if(isListViewButton && isListView || !isListViewButton && !isListView) {
            return styles.selected
        }
        return ''
    }

    // render

    return (
        <>
            <main id={styles.container}>
                <div className={styles.pageHeader}>
                    <h1>Gestion des droits utilisateurs</h1>
                    <p>Créez, recherchez, mettez à jour ou effacez les informations des utilisateurs de GEMEX</p>
                </div>
                <div className={styles.sectionContainer}>
                    <ul>
                    {
                        categories.map((category, index) => {
                            const { label, icon } = category
                            
                            return (
                                <li 
                                    key={`${label}_${index}`}
                                    className={getCategoryClassNames(category)}
                                    onClick={() => handleCategoryClick(category)}>
                                    <FontAwesomeIcon icon={icon} />
                                    { label }
                                </li>
                            )
                        })
                    }
                    </ul>
                    <section>
                        <div className={styles.searchForm}>
                            <div className={styles.row + " scroll"}>
                                <SearchBar 
                                    className={styles.searchBar}
                                    itemType={selectedCategory.itemType} 
                                    hideSelect
                                    hideCTA
                                    onInputChange={newVal => setSearchQ(newVal)}
                                    defaultValue={searchQ}
                                    fullWidth
                                />
                            {
                                selectedCategory.searchParams.map((param, index) => {
                                    // get the conf for the current param
                                    const conf = searchConf[selectedCategory.itemType].searchParams[param]
                                    switch(conf.type) {
                                        case "itemList":
                                            if(!conf.item) return (
                                                <Select
                                                    key={`${param}_${index}`}
                                                    name={param}
                                                    options={selectedCategory.searchParamsData[param]}
                                                    value={searchParams[param] as string[]}
                                                    isMulti
                                                    bigPadding
                                                    row
                                                    onChange={newVal => handleSearchParamChange(param, newVal)}
                                                />
                                            )
                                            return (
                                                <ItemMultiSelect
                                                    key={`${param}_${index}`}
                                                    name={param}
                                                    itemType={conf.item as string}
                                                    selected={searchParams[param]}
                                                    fullWidth
                                                    bigPadding
                                                    row
                                                    onChange={newVal => handleSearchParamChange(param, newVal)}
                                                />
                                            )
                                        default:
                                            if(!(conf.type in apiURLs)) return <></>
                                            return (
                                                <ItemSelect
                                                    key={`${param}_${index}`}
                                                    name={param}
                                                    itemType={conf.type as string}
                                                    selected={searchParams[param]}
                                                    fullWidth
                                                    bigPadding
                                                    onChange={(newVal: any) => handleSearchParamChange(param, newVal)}
                                                    
                                                />
                                            )
                                                
                                            
                                    }
                                })
                            }
                            </div>
                            <div className={styles.row}>
                                <div className={styles.viewModeContainer}>
                                    <Button
                                        className={getViewModeButtonClassName(false)}
                                        icon={faTableCellsLarge}
                                        role="tertiary"
                                        bigPadding
                                        onClick={() => setIsListView(false)}>
                                        Cartes
                                    </Button>
                                    <Button
                                        className={getViewModeButtonClassName(true)}
                                        icon={faList}
                                        role="tertiary"
                                        bigPadding
                                        onClick={() => setIsListView(true)}>
                                        Liste
                                    </Button>
                                </div>
                                <Pagination
                                    currentPageNb={currentPageNb}
                                    totalPagesNb={totalPagesNb}
                                    setPageNb={setCurrentPageNb}
                                />
                                <Button
                                    icon={selectedCategory.createIcon}
                                    bigPadding
                                    onClick={() => {
                                        if(selectedCategory.itemType == "users") setShowUserCreateForm(true)
                                        else setShowRoleCreateForm(true)
                                    }}>
                                    Créer un { selectedCategory.labelSingular }
                                </Button>
                            </div>
                        </div> 
                    </section>
                </div>
            </main>
            <UserFormModal
                isVisible={showUserCreateForm}
                closeModal={() => setShowUserCreateForm(false)}
                refresh={refresh}
            />
            <RoleFormModal
                isVisible={showRoleCreateForm}
                closeModal={() => setShowRoleCreateForm(false)}
                refresh={refresh}
            />
        </>
    )
}


export default UserManagementDashboard