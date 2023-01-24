import { apiURLs } from "@conf/api/conf"
import { searchConf, SearchResultsMetaData } from "@conf/api/search"
import { MySession } from "@conf/utility-types"
import { AxiosResponse } from "axios"
import SSRmakeAPIRequest from "./ssr-make-api-request"


// The following function (think of it as a SSR hook) gets relevant meta-data for each search result item
// from our backend API, & according to the current item type

// meta-data here means the data displayed on the search result item cards
// on the search page

export const SSRGetMetaData = async (itemType: string, searchResults: any[], session: MySession) => {

    // go through the search results array
    // and get the meta-data for each item
        
    // start with getting the list of values for each field that requires an API request
    
    const itemDataFields = searchConf[itemType].searchResultFields.filter(field => {
        return searchConf[itemType].searchParams[field].type in apiURLs
    })
    
    // get the value (usually an ID) for each field and remove duplicates
    const itemDataValuesArray = itemDataFields.map(field => {
        return Array.from(new Set(searchResults.map(item => item[field])))
    })

    // build an object that contains the field names as keys 
    // and the list of values as values
    let itemData: SearchResultsMetaData = Object.fromEntries(itemDataFields.map((field, index) => {
        return [field, { ids: itemDataValuesArray[index], values: [] }]
    }))


    // utility

    const reqSuccessful = (data: string | Error | undefined) => {
        return typeof data != "undefined" && !(data instanceof Error)
    }

    // make an API request for each value of each field

    // for each field


    for(const field of Object.keys(itemData)) {
        
        // API request for each value

        let index = 0

        for(const value of itemData[field].ids) {

            // don't make a request if the value is null
            if(value == null) return

            // format the received data before displaying it
            const handleSuccess = (res: AxiosResponse) => {
                const fieldConf = searchConf[itemType].searchParams[field]
                let data = ""
                // get user's full name in case data represents a User
                if(fieldConf.type == "users") {
                    data = res.data.prenom + " " + res.data.nom
                } else if(fieldConf.type == "elements") {
                    // show Element.nom & Element.numero
                    data = res.data.nom + " - " + res.data.numero
                } else if(!searchConf.hasOwnProperty(fieldConf.type)) {
                    data = res.data.nom
                } else {
                    const defaultAttribute = searchConf[fieldConf.type].defaultSearchParam
                    data = res.data[defaultAttribute]
                }
                return data
            }
            
            // make the request
            const metaData = await SSRmakeAPIRequest({
                session: session,
                verb: "get",
                itemType: searchConf[itemType].searchParams[field].type,
                additionalPath: `id/${value}`,
                onSuccess: handleSuccess
            })
            
            // if everything went well,
            // store the retrieved & formatted data
            // @ts-ignore
            itemData[field].values[index] = reqSuccessful(metaData) ? metaData : "" 
            index += 1
        }
    }

    // send back the result
    return itemData
}
