import Button from "@components/button";
import ItemSelect from "@components/form-elements/item-select";
import ItemMultiSelect from "@components/form-elements/multi-select";
import SearchBar from "@components/form-elements/search-bar";
import Select from "@components/form-elements/select";
import GroupFormModal from "@components/modals/user-management/group-form-modal";
import RoleFormModal from "@components/modals/user-management/role-form-modal";
import UserFormModal from "@components/modals/user-management/user-form-modal";
import Pagination from "@components/pagination";
import LoadingIndicator from "@components/utils/loading-indicator";
import { apiURLs } from "@conf/api/conf";
import { permissionList, suppressionList } from "@conf/api/data-types/user";
import { getFilterLabel, searchConf } from "@conf/api/search";
import { MySession } from "@conf/utility-types";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faList, faShieldHalved, faTableCellsLarge, faUserGroup, faUserPlus, faUsers, faUserShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAPIRequest from "@hook/useAPIRequest";
import styles from "@styles/pages/user-management-dashboard.module.scss"
import { Context } from "@utils/context";
import { capitalizeFirstLetter } from "@utils/general";
import { SelectOption } from "@utils/react-select/types";
import { parseURLQuery } from "@utils/search-utils";
import SSRmakeAPIRequest from "@utils/ssr-make-api-request";
import { AxiosResponse } from "axios";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { useContext, useEffect, useRef, useState } from "react"
import { authOptions } from "./api/auth/[...nextauth]";
import Image from "next/image";
import UserCard from "@components/cards/user-management-dashboard/user-card";
import { UserManagementCardProps, UserManagementViewModalProps } from "@utils/types";
import RoleCard from "@components/cards/user-management-dashboard/role-card";
import UserGroupCard from "@components/cards/user-management-dashboard/user-group-card";
import UserViewModal from "@components/modals/user-management/user-view-modal";
import RoleViewModal from "@components/modals/user-management/role-view-modal";
import UserGroupViewModal from "@components/modals/user-management/group-view-modal";
import FieldContainer from "@components/form-elements/field-container";
import Label from "@components/form-elements/label";
import CheckBox from "@components/form-elements/checkbox";


const resultsPerPage = 30

interface CategoryType {
    label: string;
    labelSingular: string;
    itemType: string;
    icon: IconProp;
    createIcon: IconProp;
    searchParams: string[];
    searchParamsData: {
        [key: string]: SelectOption[];
    };
    cardComponent: (props: UserManagementCardProps<any>) => JSX.Element;
    viewComponent: (props: UserManagementViewModalProps<any>) => JSX.Element;
}

interface SearchParamsType {
    [key: string]: any;
}

interface Props {
    itemType: "roles" | "users" | "groups";
    initSearchParams: SearchParamsType;
    results: any[];
}


const UserManagementDashboard = (
    {
        itemType,
        initSearchParams,
        results
    }: Props
) => {

    // keep the categories in an array

    const categories: CategoryType[] = [
        {
            label: "Utilisateurs",
            labelSingular: "utilisateur",
            itemType: "users",
            icon: faUsers,
            createIcon: faUserPlus,
            searchParams: [
                "role_id",
                "groups",
                "is_active"
            ],
            searchParamsData: {},
            cardComponent: UserCard,
            viewComponent: UserViewModal
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
            },
            cardComponent: RoleCard,
            viewComponent: RoleViewModal
        },
        {
            label: "Groupes",
            labelSingular: "groupe",
            itemType: "groups",
            icon: faUserGroup,
            createIcon: faUserGroup,
            searchParams: [],
            searchParamsData: {},
            cardComponent: UserGroupCard,
            viewComponent: UserGroupViewModal
        }
    ]

    // state

    // trigger refresh of the search results

    const [refreshTrigger, setRefreshTrigger] = useState(false)

    const refresh = () => setRefreshTrigger(!refreshTrigger)

    // keep track of which category is selected

    const getInitCategory = () => categories.find(c => c.itemType == itemType) || categories[0]

    const [selectedCategory, setSelectedCategory] = useState(getInitCategory())

    // search form data

    const [searchQ, setSearchQ] = useState("")

    const [searchParams, setSearchParams] = useState<SearchParamsType>(initSearchParams)

    useEffect(() => console.log("search params => ", searchParams), [searchParams])

    // search results

    const [searchResults, setSearchResults] = useState(results)

    // keep the search params in sync with the selected category

    useEffect(() => {
        // if the search params list for the selected category is empty,
        // empty the search params
        if (selectedCategory.searchParams.length == 0) {
            setSearchParams({})
            return
        }
        
        // if the correct search params are already set, do nothing
        if (selectedCategory.searchParams.every(param => searchParams.hasOwnProperty(param))) return
        // otherwise, reset the search params
        const params: SearchParamsType = {}
        selectedCategory.searchParams.forEach(param => {
            let initVal 
            // skip if param is already set
            if (searchParams.hasOwnProperty(param)) {
                params[param] = searchParams[param]
                return
            }
            // get the conf for the current param
            const conf = searchConf[selectedCategory.itemType].searchParams[param]
            switch(conf.type) {
                case "itemList":
                    initVal = []
                    break
                case "boolean":
                    initVal = true
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


    // if the selected category is roles,
    // flatten the permissions & suppression arrays to string
    // separated by commas

    const parseSearchParams = () => {
        const params = {...searchParams}
        // delete key/value pair from search params if value is empty
        for(const param in params) {
            let conf = searchConf[selectedCategory.itemType].searchParams[param]
            if(conf && conf.type !== "boolean" && !params[param] || params[param] == 0 && conf && conf.type in apiURLs) delete params[param]
        }
        // if the selected category is roles
        if (selectedCategory.itemType == "roles") {
            params.permissions = params.permissions?.join(",")
            params.suppression = params.suppression?.join(",")
        }
        // if the search q is not empty
        if(searchQ) {
            const mainAttr = searchConf[selectedCategory.itemType].defaultSearchParam
            // include it in the search params
            params[mainAttr] = searchQ
        }
        return params
    }

    // on each search request, get the number of results
    // & compute the total number of pages

    const getNbResults = () => {
        // make a request to our API to get the number of search results
        // & divide that by the number of results per page 
        makeAPIRequest<{nb_results: number}, void>(
            "post", 
            selectedCategory.itemType,
            "search/nb",
            parseSearchParams(),
            (res: AxiosResponse<{nb_results: number}>) => setNbResults(res.data.nb_results),
            () => console.log("search params => ", searchParams)
        )
    }

    useEffect(getNbResults, [searchResults])

    useEffect(() => setTotalPagesNb(Math.ceil(nbResults / resultsPerPage)), [nbResults])

    // go back to the first page
    // when the search parameters or the search item change
    
    useEffect(() => {
        setCurrentPageNb(1)
        getNbResults()
    }, [selectedCategory, searchQ, searchParams])

    // fetch data on page change
    // & when the item type or the search params are updated

    useEffect(() => {

        // let the user know we're fetching data

        setIsLoading(true)

        // cancel previous request if it exists

        if(typeof reqController.current != "undefined") reqController.current.abort()

        // new abort controller for the new request we're going to make

        reqController.current = new AbortController()

        // make a request to our backend API

        const handleSuccess = (res: AxiosResponse<any[]>) => { // if our request succeeded
            // extract the data from the response object
            setSearchResults([...res.data])
            setIsLoading(false)
            reqController.current = undefined
        }

        makeAPIRequest<any[], void>(
            "post", 
            selectedCategory.itemType,
            `search/?skip=${(currentPageNb - 1) * resultsPerPage}&max=${resultsPerPage}`,
            parseSearchParams(),
            handleSuccess,
            undefined,
            reqController.current.signal
        )

    }, [selectedCategory, searchQ, searchParams, currentPageNb, refreshTrigger])

    // manage view mode (list or card)

    const [isListView, setIsListView] = useState<boolean>(true)

    // manage modals 

    const [showUserCreateForm, setShowUserCreateForm] = useState(false)

    const [showRoleCreateForm, setShowRoleCreateForm] = useState(false)

    const [showGroupCreateForm, setShowGroupCreateForm] = useState(false)

    const [showViewModal, setShowViewModal] = useState(false)

    const [viewItem, setViewItem] = useState<any>()

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

    const getResultsContainerClassNames = () => {
        let classNames = styles.results
        classNames += isListView ? ' ' + styles.listView :  ''
        return classNames
    }

    // dealing with multi select where the options
    // don't come from the API
    // like role permissions & suppression

    // get the value of an option from its label
    // and vice versa
    // this is needed because the Select component

    const getOptionValue = (optionLabel: string, options: SelectOption[]) => {
        const option = options.find(opt => opt.label == optionLabel)
        if(!option) return ""
        return option.value as string
    }

    const getOptionValueForEach = (optionLabels: string[], options: SelectOption[]) => {
        console.log("optionLabels => ", optionLabels)
        console.log("options => ", options)
        console.log("value for each => ", optionLabels.map(label => getOptionValue(label, options)))
        return optionLabels.map(label => getOptionValue(label, options))
    }

    const getValueForOption = (optionValue: string, options: SelectOption[]) => {
        const option = options.find(opt => opt.value == optionValue)
        if(!option) return ""
        return option.label as string
    }

    const getValueForOptionForEach = (optionValues: string[], options: SelectOption[]) => {
        return optionValues.map(value => getValueForOption(value, options))
    }

    // keep nav history up to date

    const { navHistory, setNavHistory } = useContext(Context)

    useEffect(() => {
        // build the query string from the latest search params
        // @ts-ignore
        const query = new URLSearchParams(searchParams).toString()
        // get rid of the last update we made to the nav history
        const newNavHistory = navHistory.slice(0, navHistory.length - 1)
        // replace it with the URL corresponding to the current search params
        setNavHistory([...newNavHistory, `/user-management-dashboard?item=${selectedCategory.itemType}&${query}`])
    }, [searchParams, itemType])

    // useEffect(() => console.log("search results => ", searchResults), [searchResults])

    // render

    return (
        <>
            <main id={styles.container}>
                <div className={styles.pageHeader}>
                    <h1>Gestion des droits utilisateurs</h1>
                    <p>Créez, recherchez, mettez à jour ou effacez les informations des utilisateurs de GEMEX</p>
                </div>
                <div className={styles.sectionContainer}>
                    <ul className={styles.categories}>
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
                            <div className={styles.col}>
                                <SearchBar 
                                    className={styles.searchBar}
                                    itemType={selectedCategory.itemType} 
                                    hideSelect
                                    hideCTA
                                    onInputChange={newVal => setSearchQ(newVal)}
                                    defaultValue={searchQ}
                                    fullWidth
                                />
                                <div className={styles.row}>
                                {
                                    selectedCategory.searchParams.map((param, index) => {
                                        // get the conf for the current param
                                        const conf = searchConf[selectedCategory.itemType].searchParams[param]
                                        let filterComponent = null
                                        switch(conf.type) {
                                            case "itemList":
                                                if(!conf.item)  {
                                                    const options = selectedCategory.searchParamsData[param]
                                                    const value = param in searchParams ? getValueForOptionForEach(searchParams[param] as string[], options) : []
                                                    filterComponent =  (
                                                        <Select
                                                            name={param}
                                                            options={selectedCategory.searchParamsData[param]}
                                                            defaultValue={value}
                                                            value={value}
                                                            isMulti
                                                            bigPadding
                                                            row
                                                            onChange={newVal => handleSearchParamChange(param, getOptionValueForEach(newVal, options))}
                                                        />
                                                    )
                                                    break
                                                }
                                                filterComponent = (
                                                    <ItemMultiSelect
                                                        name={param}
                                                        itemType={conf.item as string}
                                                        defaultValue={param in searchParams ? searchParams[param] as string[] : []}
                                                        selected={searchParams[param]}
                                                        fullWidth
                                                        bigPadding
                                                        row
                                                        onChange={newVal => handleSearchParamChange(param, newVal)}
                                                    />
                                                )
                                                break
                                            case "boolean":
                                                filterComponent =  (
                                                    <CheckBox
                                                        value={param in searchParams ? searchParams[param] as boolean : true}
                                                        onChange={newVal => handleSearchParamChange(param, newVal)}
                                                    />
                                                )
                                                break
                                            default:
                                                if(!(conf.type in apiURLs)) return <></>
                                                filterComponent = (
                                                    <ItemSelect
                                                        name={param}
                                                        itemType={conf.type as string}
                                                        defaultValue={param in searchParams ? searchParams[param] : undefined}
                                                        selected={searchParams[param]}
                                                        bigPadding
                                                        onChange={newVal => handleSearchParamChange(param, newVal)}
                                                    />
                                                )       
                                        }
                                        return (
                                            <FieldContainer
                                                key={`${param}_${index}`} 
                                                fullWidth={conf.type == "itemList"}>
                                                <Label>{ getFilterLabel(param, conf) }</Label>
                                                { filterComponent }
                                            </FieldContainer>
                                        )
                                    })
                                }
                                </div>
                            </div>
                            <p className={styles.resultsCount}>{ nbResults } résultat{ searchResults.length != 1 ? 's' : '' } au total</p>
                            <div className={styles.row}>
                                {
                                    // if there are search results
                                    // display the view mode buttons
                                    searchResults.length > 0 ?
                                    <>
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
                                    </>
                                    :
                                    <></>
                                }
                                <Button
                                    className={searchResults.length < 1 ? styles.createButton : ''}
                                    icon={selectedCategory.createIcon}
                                    bigPadding
                                    onClick={() => {
                                        switch(selectedCategory.itemType) {
                                            case "users":
                                                setShowUserCreateForm(true)
                                                break
                                            case "roles":
                                                setShowRoleCreateForm(true)
                                                break
                                            case "groups":
                                                setShowGroupCreateForm(true)
                                                break
                                        }
                                    }}>
                                    Créer un { selectedCategory.labelSingular }
                                </Button>
                            </div>
                        </div> 
                        {
                            // don't display any content
                            // if there aren't no search results
                            searchResults.length > 0 && !isLoading ?
                            <ul className={getResultsContainerClassNames()}>
                            {
                                searchResults.map((item, index) => (
                                    <selectedCategory.cardComponent
                                        key={`${item._id}_${index}`}
                                        data={item}
                                        listView={isListView}
                                        onClick={() => {
                                            setViewItem(item)
                                            setShowViewModal(true)
                                        }}
                                    />
                                ))
                                    
                            }
                            </ul>
                            :
                            // while loading
                            // display a loading indicator
                            isLoading ?
                            <div className={styles.loadingIndicatorContainer}>
                                <LoadingIndicator/>
                                <h4>Chargement...</h4>
                            </div>
                            :
                            // if there aren't any results
                            // display the corresponding illustration
                            // & a message for the user
                            <div className={styles.noResultsMessageContainer}>
                            <div className={styles.illustrationContainer}>
                                <Image 
                                    quality={100}
                                    src={'/images/no-results-illustration.svg'} 
                                    alt={"Aucun résultat."} 
                                    priority
                                    fill
                                    style={{ 
                                        objectFit: "contain", 
                                        top: "auto"
                                    }}
                                />
                            </div>
                            <h1>Aucun résultat...</h1>
                            <p>Ré-essayer en changeant les paramètres de recherche</p>
                        </div>
                        }
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
            <GroupFormModal
                isVisible={showGroupCreateForm}
                closeModal={() => setShowGroupCreateForm(false)}
                refresh={refresh}
            />
            <selectedCategory.viewComponent
                isVisible={showViewModal}
                closeModal={() => {
                    setShowViewModal(false)
                    setViewItem(undefined)
                }}
                data={viewItem}
                refresh={refresh}
            />
        </>
    )
}


export const getServerSideProps: GetServerSideProps<Props> = async (context) => {

    // get initial search results by making a request to the API
    // start by parsing the URL query into an object
    // that contains valid search params for our API

    const [itemType, searchParams] = parseURLQuery(context.query)

    // in case something goes wrong

    const emptyProps: { props: Props } = {
        props: {
            itemType: ["users", "roles", "groups"].includes(itemType) ? itemType as "users" | "roles" | "groups" : "users",
            initSearchParams: searchParams,
            results: []
        }
    }

    // retrieve the session, with the user's auth token

    const session = (await unstable_getServerSession(context.req, context.res, authOptions)) as MySession | null

    if(session == null) return emptyProps

    // make the request to the API

    const results = await SSRmakeAPIRequest<any[], any[]>({
        session: session,
        verb: "post",
        itemType: itemType,
        additionalPath: `search/?skip=0&max=${resultsPerPage}`, // get page 1
        data: searchParams,
        onSuccess: res => res.data
    })

    // pass the result as props

    return {
        props: {
            itemType: itemType as "users" | "roles" | "groups",
            initSearchParams: searchParams,
            results: results ? results : []
        }
    }

}


export default UserManagementDashboard