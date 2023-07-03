

// determine which create button the user should get (on the nav bar)

import Button from "@components/button"
import { faAngleDown, faAngleUp, faFileCirclePlus } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useRef, useState } from "react"

import styles from "@styles/layout/header/create-button.module.scss"
import { creatableItemsList } from "@conf/general"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { MySession } from "@conf/utility-types"

const CreateButton = () => {

    // get info about the current user's permissions

    const session = useSession().data as MySession | null

    const userRole = session?.userRole 

    const [userPermissions, setUserPermissions] = useState<string[]>()

    useEffect(() => {
        setUserPermissions(userRole?.permissions.split(','))
    }, [userRole])


    // if the user doesn't have create permission on any of the items above
    // or on Fiche objects
    // don't show the create button

    const getAuthorizedCreatableItems = () => {
        return creatableItemsList.filter(item => {
            return userPermissions?.includes(item.permission)
        })
    }

    const getAuthorizedItemsCount = () => getAuthorizedCreatableItems().length
    
    const shouldShowCreateButton = () =>  getAuthorizedItemsCount() > 0

    const allowMultipleItems = getAuthorizedItemsCount() > 1


    const router = useRouter()

    const handleCreateFicheClick = () => router.push("/create/fiches")

    // handle dropdown visibility

    const [showDropdown, setShowDropdown] = useState(false)

    const toggle = () => setShowDropdown(!showDropdown)

    // make the container bigger when the dropdown is visible

    const getContainerClassNames = () => {
        return styles.dropdownContainer + (showDropdown ? ' ' + styles.showDropdown : '')
    }

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

    useEffect(() => {

        document.addEventListener('mousedown', closeIfClickOutside)
    
        return () => {
            document.removeEventListener('mousedown', closeIfClickOutside)
        }
    }, [])

    // render

    return (
        shouldShowCreateButton() ?
        allowMultipleItems ?
            <div className={getContainerClassNames()}>
                <Button
                    ref={buttonRef}
                    icon={showDropdown ? faAngleUp : faAngleDown}
                    role="tertiary"
                    onClick={toggle}>
                    Créer
                </Button>
                {
                    showDropdown &&
                    <ul ref={dropdownRef}>
                    {
                        getAuthorizedCreatableItems().map(({ value, label, icon }, index) => {
                            const href = `/create/${value}`
                            return (
                                <li key={index}>
                                    <Link href={href}>
                                        <FontAwesomeIcon icon={icon}/> 
                                        { label }
                                    </Link>
                                </li>
                            )
                        })
                    }
                    </ul>
                }
            </div>
        :
            <Button
                icon={faFileCirclePlus}
                role="tertiary"
                onClick={handleCreateFicheClick}>
                <Link href="/create/fiches">
                    Nouvelle Fiche
                </Link>
            </Button>
        :
        <></>
    )

}

export default CreateButton