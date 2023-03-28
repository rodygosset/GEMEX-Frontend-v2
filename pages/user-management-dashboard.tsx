import Button from "@components/button";
import SearchBar from "@components/form-elements/search-bar";
import Pagination from "@components/pagination";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faList, faShieldHalved, faTableCellsLarge, faUserPlus, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAPIRequest from "@hook/useAPIRequest";
import styles from "@styles/pages/user-management-dashboard.module.scss"
import { useRef, useState } from "react"

interface CategoryType {
    label: string;
    itemType: string;
    icon: IconProp;
    searchParams: string[];
}


const UserManagementDashboard = () => {

    // keep the 2 categories in an array

    const categories: CategoryType[] = [
        {
            label: "Utilisateurs",
            itemType: "users",
            icon: faUsers,
            searchParams: [
                "role_id",
                "groups"
            ]
        },
        {
            label: "Roles",
            itemType: "roles",
            icon: faShieldHalved,
            searchParams: [
                "permissions",
                "suppression"
            ]
        }
    ]

    // state

    // keep track of which category is selected

    const [selectedCategory, setSelectedCategory] = useState(categories[0])

    // search form data

    const [searchQ, setSearchQ] = useState("")

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

    // handlers

    const handleCategoryClick = (category: CategoryType) => setSelectedCategory(category)

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
                        <div className={styles.row}>
                            <SearchBar 
                                className={styles.searchBar}
                                itemType={selectedCategory.itemType} 
                                hideSelect
                                hideCTA
                                onInputChange={newVal => setSearchQ(newVal)}
                                defaultValue={searchQ}
                                fullWidth
                            />

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
                                icon={faUserPlus}
                                bigPadding
                                onClick={() => {}}>
                                Créer un utilisateur
                            </Button>
                        </div>
                    </div>
                    
                </section>
            </div>
        </main>
    )
}


export default UserManagementDashboard