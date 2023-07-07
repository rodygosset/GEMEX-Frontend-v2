import TextInput from "@components/form-elements/text-input"
import GoBackButton from "@components/go-back-button"
import HorizontalSeperator from "@components/utils/horizontal-seperator"
import VerticalScrollBar from "@components/utils/vertical-scrollbar"
import { itemTypes } from "@conf/api/search"
import { createFormConf, FormElement, FormFieldsObj } from "@conf/create"
import useAPIRequest from "@hook/useAPIRequest"
import styles from "@styles/page-templates/create-template.module.scss"
import { capitalizeEachWord, toSingular } from "@utils/general"
import { DynamicObject } from "@utils/types"
import { AxiosResponse, isAxiosError } from "axios"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import CreateForm from "@components/forms/create-form"
import { fichesEditConf } from "@conf/api/data-types/fiche"
import Button from "@components/button"
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons"
import { useSession } from "next-auth/react"
import { MySession } from "@conf/utility-types"

interface Props {
    itemType: string;
    excluded?: string[];
    defaultValues: DynamicObject;
}

const EditTemplate = (
    {
        itemType,
        excluded,
        defaultValues
    }: Props
) => {

    // access url query 

    const router = useRouter()

    // state which will hold the form data
    // => each field's value & its configuration info

    const [formData, setFormData] = useState<FormFieldsObj>()

    // get user role

    const session = useSession()
    
    const userRole = (session.data as MySession | null)?.userRole

    // build the object which will hold our form's state
    // its shape is determined by the createFormConf for the current item type
    // it's a list of key / value pairs for which the keys are an attribute
    // of the current item type => a key of formConf
    // & the values are the values the user entered in the form
    // => the default values are loaded by the following function 
    // as it builds this object

    const getInitFormData = () => {
        if(!(itemType in createFormConf)) return {}

        // load the form fields for the current item type
        // also make sure not to include excluded fields in the form
        let fields = (
            Object.entries<FormElement>(createFormConf[itemType])
            .filter(([field]) => !getExcludedFields().includes(field))
            // don't include a field unless it's in defaultValues
            .filter(([field]) => field in defaultValues)
        )

        let initFormData: FormFieldsObj = {}

        for(let [field, conf] of fields) {
            // load the default value, from defaultValues, if it is present
            let defaultValue = null;
            if(isEmpty(defaultValues[field]) && typeof conf.defaultValue != 'undefined') {
                defaultValue = conf.defaultValue;
            } else {
                defaultValue = defaultValues[field]
            }

            // for each form field
            // load it's config info into the form component's state
            initFormData[field] = {
                value: defaultValue,
                conf: {...conf}
            }
        }

        // once we're done loading the form data for the current item
        // return it
        return initFormData
    }

    useEffect(() => setFormData(getInitFormData()), [itemType, defaultValues])

    useEffect(() => console.log(formData), [formData])

    // the following function is passed to form elements 
    // so they can update the value of the field they're rendering

    const updateField = (fieldName: string, newValue: any) => {
        let newFormData = { ...formData }
        newFormData[fieldName].value = newValue;
        // update the error state is the field ain't empty
        if(newFormData[fieldName].isInErrorState) {
            newFormData[fieldName].isInErrorState = isEmpty(newValue)
        }
        // console.log(`'${fieldName}' was updated!`)
        // console.log(newValue)
        setFormData(newFormData)
    }

    // force re-render

    const [refreshTrigger, setRefreshTrigger] = useState(false)

    const refresh = () => setRefreshTrigger(!refreshTrigger)

    // get the value of each field
    // & build an object we can send in a POST request to our backend API

    const buildSubmitData = () => {
        let submitData: DynamicObject = {}
        for(const field in formData) {
            // make sure unauthorized users don't assign tasks to others
            if(itemType.includes("fiches") && formData[field].conf.type == "users" 
            && !userRole?.permissions.includes("manage")) {
                continue
            }
            // don't include fields that haven't been updated
            if(formData[field].value == defaultValues[field]) {
                continue
            } 
            // if "nom" has been updated, 
            // include the new value in the submit data as "new_nom"
            if(field == "nom") {
                if(formData[field].value != defaultValues[field]) {
                    submitData["new_nom"] = formData[field].value
                }
                continue
            }
            // normal path
            submitData[field] = formData[field].value;
        }
        return submitData
    }

    // submit logic

    const makeAPIRequest = useAPIRequest()

    // make sure no required field is left empty
    

    const defaultValidationErrorMessage = "Remplissez les champs requis avant de soumettre le formulaire"

    const [validationErrorMessage, setValidationErrorMessage] = useState("")

    const getValidationErrorMessage = () => !isEmpty(validationErrorMessage) ? validationErrorMessage : defaultValidationErrorMessage

    const isEmpty = (value: any) => {
        if(typeof value == "string") return !value
        return typeof value == "undefined" || value == null
    }

    const ficheTargetItemTypes = [
        "exposition_id",
        "element_id"
    ]

    // the following function checks whether any of the fiche target item type fields
    // has a value

    const isFicheTargetItemEmpty = () => {
        if(!formData) return true
        let isTargetFieldEmpty = true
        for(const fieldName of ficheTargetItemTypes) {
            if(!isEmpty(formData[fieldName].value)) {
                isTargetFieldEmpty = false
            }
        }
        return isTargetFieldEmpty
    }

    // validate the form before submitting it

    const [validationError, setValidationError] = useState(false)

    const validateFormData = async () => {
        if(!formData || !session.data) return false
        let validated = true

        const validateField = (fieldName: string) => {
            // if the value of the current field is empty
            // let the user know by highlighting the field
            // using error state

            // but first, exclude fiche target item fields
            // cause they're nullable
            if(itemType.includes("fiches") && ficheTargetItemTypes.includes(fieldName)) {
                return
            }
            // proceed
            if(isEmpty(formData[fieldName].value) && formData[fieldName].conf.required) {
                formData[fieldName].isInErrorState = true
                validated = false
            }
        }

        // run check for each field

        for(const fieldName in formData) {
            validateField(fieldName)
        }

        if(itemType.includes("fiches") && isFicheTargetItemEmpty()) {
            formData["element_id"].isInErrorState = true
            validated = false
        }

        // make sure the new item title isn't taken already
        // => expect a 404 when trying to get

        if("new_nom" in buildSubmitData()) {
            await makeAPIRequest<any, void>(
                session.data as MySession,
                "get",
                itemType,
                formData["nom"].value,
                undefined,
                res => {
                    // if there is an item with this title
                    // invalidate the form & let the user know
                    formData["nom"].isInErrorState = true
                    validated = false
                    setValidationErrorMessage(`Le nom '${formData["nom"].value}' est déjà pris`)
                },
                err => {
                    // log the error if it was anything but a 404
                    if(!isAxiosError(err) || err.response?.status != 404) {
                        console.log(err)
                        return
                    }
                    // if it was a 404, everything's good
                }
            )
        }

        return validated
    }

    const handleSubmit = async () => {
        if(!session.data) return
        const submitData = buildSubmitData()
        // console.log("submit data ==> ")
        // console.log(submitData)
        // return
        // console.log("is validated ? => ", validateFormData())
        if(!(await validateFormData())) {
            setValidationError(true)
            refresh()
            return
        } else {
            setValidationError(false)
            refresh()
        }
        // POST the form data to the appropriate API endpoint
        // if our form submission was successful

        const handleSuccess = (res: AxiosResponse<any>) => {
            // in case our request succeeded
            if(res.status == 200) {
                // redirect the user to the view page
                // for the new item that's been create
                const getItemType = () => itemType.replace('_', '/')
                router.push(`/view/${getItemType()}/${res.data.id}`)
            }
        }

        // PUT the data

        makeAPIRequest(
            session.data as MySession,
            "put",
            itemType,
            defaultValues["nom"],
            submitData,
            handleSuccess
        )

    }

    // utils

    const getItemTypeLabel = () => {
        const label = itemTypes.find(type => type.value == itemType)?.label.slice(0, -1)
        let itemLabel = itemType?.split('_').length > 1 ? toSingular(itemType) : label || ""
        // account for Fiche items
        // => add the fiche type
        if(itemType && itemType.includes("fiches")) itemLabel = `Fiche ${defaultValues["tags"][0]}`
        return itemLabel
    } 


    const getClassName = () => {
        if(itemType?.includes("fiches")) {
            // change the color depending on the fiche type
            switch(getFicheType()) {
                case "relance":
                    return styles.relance
                case "panne":
                    return styles.panne
                case "systématique":
                    return styles.systematique
                default:
                    return ""
            }
        }
        return ""
    }


    const getTitlePlaceHolder = () => {
        if(!(itemType in createFormConf)) return
        return createFormConf[itemType]?.nom.label
    }

    // for fiche items
    // the fiche type is the first element of the tags array
    
    const getFicheType = () => {
        if(!itemType || !itemType.includes("fiches")) return ""
        return (defaultValues["tags"][0] as string).toLowerCase()
    }

    // if the item type is Fiche, 
    // hide fields that are marked as hidden in the create conf object

    // also, in case a list of hidden fields are provided as props
    // include it in the return value

    const getExcludedFields = () => {
        if(!itemType || !itemType.includes("fiches")) {
            return excluded ? excluded : []
        }
        const excludedFields = itemType.includes("fiches") ? fichesEditConf[getFicheType()].excludedFields : []
        return excluded ? [...excluded, ...excludedFields] : excludedFields
    }

    // handlers

    // make sure the main field doesn't have spaces at the beginning or the end of it
    // to avoid bugs in communicating with the backend API

    const handleTitleChange = (newTitle: string) => updateField("nom", newTitle.trim())

    // render

    return (
        <main id={styles.container}>
            <div className={styles.backButtonContainer}>
                <GoBackButton className={getClassName()}/>
            </div>
            <section>
                <div className={styles.header}>
                    <div id={styles.itemTitle} className={getClassName()}>
                        {
                            formData && formData.nom ?
                            <TextInput 
                                className={styles.titleInput}
                                placeholder={getTitlePlaceHolder()}
                                onChange={handleTitleChange}
                                defaultValue={formData.nom.value}
                                isInErrorState={formData.nom.isInErrorState}
                            />
                            :
                            <h1>{defaultValues?.nom || ""}</h1>
                        }
                        <div className={styles.itemTypeContainer}>
                            <p>{ getItemTypeLabel() }</p>
                        </div>
                        {
                            validationError ?
                            <p className={styles.formErrorMessage}>
                                { getValidationErrorMessage() }
                            </p>
                            :
                            <></>
                        }
                    </div>
                    <Button
                        icon={faFloppyDisk}
                        onClick={handleSubmit}>
                        Sauver
                    </Button>
                </div>
                <HorizontalSeperator/>
                <VerticalScrollBar className={styles.contentScrollContainer}>
                    {
                        formData ?
                        <CreateForm
                            itemType={itemType}
                            formData={formData}
                            onChange={updateField}
                            onSubmit={handleSubmit}
                        />
                        :
                        <></>
                    }
                </VerticalScrollBar>
            </section>
        </main>
    )
}

export default EditTemplate