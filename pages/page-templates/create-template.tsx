import Select from "@components/form-elements/select"
import TextInput from "@components/form-elements/text-input"
import GoBackButton from "@components/go-back-button"
import HorizontalSeperator from "@components/utils/horizontal-seperator"
import VerticalScrollBar from "@components/utils/vertical-scrollbar"
import { itemTypes } from "@conf/api/search"
import { createFormConf, FormElement, FormFieldsObj } from "@conf/create"
import useAPIRequest from "@hook/useAPIRequest"
import styles from "@styles/page-templates/create-template.module.scss"
import colors from "@styles/abstracts/_colors.module.scss"
import { itemTypetoAttributeName, toSingular } from "@utils/general"
import { SelectOption } from "@utils/react-select/types"
import { DynamicObject } from "@utils/types"
import { AxiosResponse } from "axios"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { StylesConfig } from "react-select"
import CreateForm from "@components/forms/create-form"


// custom styles for the fiche type select


const customSelectStyles: StylesConfig = {
    control: (base, state) => ({
        ...base,
        border: "0",
        boxShadow: `0px 30px 60px ${colors["primary-400"]}`,
        background: colors["white-100"],
        paddingLeft: "10px",
        paddingRight: "10px",
        borderRadius: state.isMulti ? "10px" : "5px",
        "&:hover": {
            border: "0",
            cursor: "pointer"
        }
    }),
}

interface Props {
    itemType: string;
}

const CreateTemplate = (
    {
        itemType
    }: Props
) => {

    // access url query 

    const router = useRouter()

    // state which will hold the form data
    // => each field's value & its configuration info

    const [formData, setFormData] = useState<FormFieldsObj>()

    // build the object which will hold our form's state
    // its shape is determined by the createFormConf for the current item type
    // it's a list of key / value pairs for which the keys are an attribute
    // of the current item type => a key of formConf
    // & the values are the values the user entered in the form
    // => the default values are loaded by the following function 
    // as it builds this object

    const getInitFormData = () => {
        if(!(itemType in createFormConf)) return

        // load the form fields for the current item type

        let fields = Object.entries<FormElement>(createFormConf[itemType])

        let initFormData: FormFieldsObj = {}

        for(let [field, conf] of fields) {
            // load the default value, if there is one
            let defaultValue = null;
            if(typeof conf.defaultValue != 'undefined') {
                defaultValue = conf.defaultValue;
            }

            // for each form field
            // load it's config info into the form component's state
            initFormData[field] = {
                value: defaultValue,
                conf: {...conf}
            }
        }

        // if we're creating a Fiche
        // & the target item was provided through the URL query
        // load it

        const queryItemType = typeof router.query.itemType !== "undefined" ? router.query.itemType.toString() : ""
        const queryItemId = typeof router.query.itemId !== "undefined" ? router.query.itemId.toString() : ""

        if(itemType.includes("fiches") && queryItemType && queryItemId 
        // make sure the id is a number
        // @ts-ignore
        && !isNaN(queryItemId) && !isNaN(parseFloat(queryItemId))) {
            const fieldName = itemTypetoAttributeName(queryItemType)
            initFormData[fieldName].value = Number(queryItemId)
        }

        // once we're done loading the form data for the current item
        // return it
        return initFormData
    }

    useEffect(() => setFormData(getInitFormData()), [])
    useEffect(() => console.log(formData), [formData])

    // the following function is passed to form elements 
    // so they can update the value of the field they're rendering

    const updateField = (fieldName: string, newValue: any) => {
        let newFormData = { ...formData }
        newFormData[fieldName].value = newValue;
        // console.log(`'${fieldName}' was updated!`)
        // console.log(newValue)
        setFormData(newFormData)
    }

    // get the value of each field
    // & build an object we can send in a POST request to our backend API

    const buildSubmitData = () => {
        let submitData: DynamicObject = {}
        for(const field in formData) {
            submitData[field] = formData[field].value;
        }
        return submitData
    }

    // submit logic

    const makeAPIRequest = useAPIRequest()

    const handleSubmit = (e: SubmitEvent) => {
        e.preventDefault()
        const submitData = buildSubmitData()
        // console.log("submit data ==> ")
        // console.log(submitData)
        // POST the form data to the appropriate API endpoint
        // if our form submission was successful

        const handleSuccess = (res: AxiosResponse<any>) => {
            // in case our request succeeded
            if(res.status == 200) {
                // redirect the user to the view page
                // for the new item that's been create
                const getItemType = () => itemType == "fiches_systematiques" ? "fiches/systematiques" : itemType
                router.push(`/view/${getItemType()}/${res.data.id}`)
            }
        }

        const getItemType = () => (
            itemType == "fiches" && ficheType == "systématique" 
            ? "fiches_systematiques" : "fiches"
        )

        // POST the data

        makeAPIRequest(
            "post",
            getItemType(),
            undefined,
            submitData,
            handleSuccess
        )

    }

    // in case the item type is Fiche
    // keep track of the type of Fiche the user's chosen

    const [ficheType, setFicheType] = useState<string>("opération")

    const ficheTypeOptions: SelectOption[] = [
        {
            label: "Opération",
            value: "opération"
        },
        {
            label: "Relance",
            value: "relance"
        },
        {
            label: "Panne",
            value: "panne"
        },
        {
            label: "Systématique",
            value: "systématique"
        }
    ]

    // utils

    const getItemTypeLabel = () => {
        const label = itemTypes.find(type => type.value == itemType)?.label.slice(0, -1)
        return itemType.split('_').length > 1 ? toSingular(itemType) : label
    } 


    const getClassName = () => {
        if(itemType == "fiches") {
            // change the color depending on the fiche type
            switch(ficheType) {
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
        return createFormConf[itemType].nom.label
    }

    // render

    return (
        <main id={styles.container}>
            <div className={styles.backButtonContainer}>
                <GoBackButton className={getClassName()}/>
            </div>
            <section>
                <div id={styles.itemTitle} className={getClassName()}>
                    <TextInput 
                        className={styles.titleInput}
                        placeholder={getTitlePlaceHolder()}
                        onChange={newVal => updateField("nom", newVal)}
                    />
                    <div className={styles.itemTypeContainer}>
                        <p>{ getItemTypeLabel() }</p>
                        {
                            itemType == "fiches" ?
                            <Select
                                name="Type de fiche"
                                customStyles={customSelectStyles}
                                options={ficheTypeOptions}
                                value={ficheType}
                                defaultValue={ficheTypeOptions[0].value}
                                onChange={setFicheType}
                            />
                            :
                            <></>
                        }
                    </div>
                </div>
                <HorizontalSeperator/>
                <VerticalScrollBar className={styles.contentScrollContainer}>
                    {
                        formData ?
                        <CreateForm
                            itemType={itemType}
                            formData={formData}
                            onChange={updateField}
                        />
                        :
                        <></>
                    }
                </VerticalScrollBar>
            </section>
        </main>
    )
}

export default CreateTemplate