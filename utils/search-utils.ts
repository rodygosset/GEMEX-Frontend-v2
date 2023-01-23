import { defaultSearchItem, searchConf, SearchFilters, SearchParam, searchQueryParams } from "@conf/api/search";
import { ParsedUrlQuery } from "querystring";
import { DateInputValue, DynamicObject } from "@utils/types";

// convert the URL query string into an object 
// that contains valid search params for our API

export const parseURLQuery = (query: ParsedUrlQuery): [string, DynamicObject] => {

    if(query.item && !(query.item.toString() in searchConf)) {
        return [defaultSearchItem, {}]
    }

    const itemType =  query.item ? query.item.toString() : defaultSearchItem
    let searchParams: DynamicObject = {}

    // get the search parameters as they are, from the URL query

    for(const param in query) {
        if(searchQueryParams[itemType].includes(param)) {
            // in case the current parameter is supposed to be a list
            // but it's only one item long
            // it will be just a string inside the query object,
            // so we need to put it in an array
            if(param in searchConf[itemType] && searchConf[itemType].searchParams[param].type == 'itemList' &&
                typeof query[param] == 'string') {
                searchParams[param] = [ query[param]?.toString() ]
            } else {
                // otherwise, just add the key/value pair to the search params
                searchParams[param] = query[param]
            }
        }
    }

    return [itemType, searchParams]

}


// build a SearchFilters object from the search parameters provided in the URL query

export const toSearchFiltersObject = (itemType: string, searchParams: DynamicObject): SearchFilters => {

    // if the provided item type doesn't exist, 
    // return
    if(!(itemType in searchConf)) { return {} }

    // get the list of SearchParam objects for the provided item type 

    let itemSearchParams = Object.entries<SearchParam>(searchConf[itemType].searchParams)

    // load the search parameters
    // depending on the itemType

    let newSearchFilters: SearchFilters = {}

    for(let [param, conf] of itemSearchParams) {
        // don't load the default search parameter into the form
        // it's managed by the search bar
        if(param == searchConf[itemType].defaultSearchParam) { continue; }

        // load the default value, if there is one
        let defaultValue = null;
        if(typeof conf.defaultValue != 'undefined') {
            defaultValue = conf.defaultValue;
        }

        // for each search parameter
        // load it's config info
        newSearchFilters[param] = {
            value: defaultValue,
            conf: {...conf},
            checked: false
        }

        // if a value for the current search parameter
        // was provided through the URL query string

        const specialFilterTypes = [
            "date",
            "timeDelta",
            "numberOperator"
        ]

        if(param in searchParams) { 
            newSearchFilters[param].checked = true
            // set the value to the one provided in the query
            // adjust how the value is loaded into the filter,
            // depending on its expected type (from the conf)
            switch(conf.type) {
                case "number":
                    loadNumberParam(param, newSearchFilters, searchParams, conf)
                    break
                case "boolean":
                    // account for string boolean values and actual boolean values
                    // because the value may come from the URL query
                    // or from a CheckBox component (happens when the itemType changes for example)
                    newSearchFilters[param].value = searchParams[param] == "true" || searchParams[param] == true
                    break
                default: // text
                    newSearchFilters[param].value = searchParams[param]
                    break
            }
        } else if(specialFilterTypes.includes(conf.type)) {
            // for some types of filter
            // the name won't appear as is in the URL query
            // because it can be broken into several values
            switch(conf.type) {
                case "timeDelta":
                case "numberOperator":
                    loadNumberParam(param, newSearchFilters, searchParams, conf)
                    break
                case "date":
                    loadDateParam(param, newSearchFilters, searchParams)
                    break
                default:
                    break
            }
        }
        // turn on "is_active" by default  
        else if(param == "is_active") {
            newSearchFilters[param].checked = true
        }
    }

    // return the new SearchFilters object

    return newSearchFilters
}

// given that in the search conf object, date params aren't seperated into 
// day, month & year, 
// we use this function to check if the query string contains parameters that 
// matching the date param in the search conf for the current item type

const loadDateParam = (param: string, newSearchFilters: SearchFilters, searchParams: DynamicObject) => {
    // param has to be one of those
    const dateParams = [
        // date_smthg => annee_smthg
        param.replace('date', 'annee'),
        // date_smthg => mois_smthg
        param.replace('date', 'mois'),
        // date_smthg => jour_smthg
        param.replace('date', 'jour')
    ]

    // bridge between search param names & DateInputValue object properties
    
    const getDateUnitFromParam = (param: string) => {
        if(param.includes("annee")) return "year"
        if(param.includes("mois"))  return "month"
        if(param.includes("jour"))   return "day"
    }
    let dateInputValue: DateInputValue = {}
    for(const dateParam of dateParams) {
        if(dateParam in searchParams) {
            // get param value & store it inside our DateInputValue object
            // to be used by the SearchFilters
            // @ts-ignore
            dateInputValue[getDateUnitFromParam(dateParam)] = searchParams[dateParam]
        }
    }
    // don't load the value if it's not properly formatted
    if(!("year" in dateInputValue) || ("day" in dateInputValue && !("month" in dateInputValue))) return
    // load the value
    newSearchFilters[param].value = dateInputValue
    newSearchFilters[param].checked = true
}

// same problem here as in the above function
// in the search conf object, number

const loadNumberParam = (param: string, newSearchFilters: SearchFilters, searchParams: DynamicObject, conf: SearchParam) => {
    let paramName = conf.type == 'number' || conf.type == 'timeDelta' ? param : param.split('_')[0]
    // the search parameter can have different names in the search query depending on the operator
    const numberOperatorParams = [
        paramName,
        paramName + "_inf",
        paramName + "_inf_eg",
        paramName + "_sup",
        paramName + "_sup_eg"
    ]
    // for "operator" filters
    const operatorOptions = [
        { value: '=', label: '='}, 
        { value: '<', label: '<'}, 
        { value: '<=', label: '<='}, 
        { value: '>', label: '>'}, 
        { value: '>=', label: '>='}
    ];
    // in case one of the valid operator param names was passed as a URL query parameter
    numberOperatorParams.forEach((name, index) => {
        if(name in searchParams) {
            if(conf.type == 'number' || conf.type == 'timeDelta') {
                // load it into the SearchFilters
                newSearchFilters[param].value = searchParams[name]
                newSearchFilters[param].conf.defaultValue = searchParams[name]
                newSearchFilters[param].checked = true
            } else { // if it's a number OPERATOR
                // load the default value for the comparison operator
                newSearchFilters[param].value = operatorOptions[index].value
                newSearchFilters[param].conf.defaultValue = operatorOptions[index].value
                // load the value for the actual number & turn on the filter
                newSearchFilters[paramName].value = searchParams[name]
                newSearchFilters[paramName].conf.defaultValue = searchParams[name]
                newSearchFilters[paramName].checked = true
            }
        }
    })
}


// parse the SearchFilters object into an object containing valid search parameters
// for the current item type, that we can use in the search request to our API

export const toURLQuery = (searchFilters: SearchFilters, searchParams: DynamicObject, itemType: string): DynamicObject => {
    let urlQuery: DynamicObject = { item: itemType }

    // iterate over the list of search filters to build the URL query
    
    const searchFiltersArray = Object.entries(searchFilters)

    for(const [filterName, filterData] of searchFiltersArray) {

        const { conf } = filterData
        let searchParamName = filterName

        // don't add unchecked or empty search parameters to the URL query

        const emptyValues = [
            null,
            undefined,
            ""
        ]

        if(!filterData.checked || emptyValues.includes(filterData.value)
        // account for arrays
        || Array.isArray(filterData.value) && filterData.value.length == 0) { continue }

        // the following switch statement is used to make adjustements
        // to values of particular data types
        // before adding the key / value pair to the URL query

        switch(conf.type) {
            case "timeDelta":
            case "number" : 
                let operatorParamName = filterName + "_operator";
                if(operatorParamName in searchFilters) {
                    searchParamName += numberOperatorValueToSearchParam(searchFilters[operatorParamName].value)
                }
                break;
            case "date":
                if(!filterData.value) { continue; }
                dateToSearchParam(filterData.value, urlQuery, searchParamName)
                continue;
        }

        // once necessary adjustements have been made
        // update the URL query object
        urlQuery[searchParamName] = filterData.value
    }

    // retrieve the default search parameter for the item
    // and add it to the urlQuery if it is set and isn't empty
    if(searchConf[itemType].defaultSearchParam in searchParams) {

        let { defaultSearchParam } = searchConf[itemType]

        if(searchParams[defaultSearchParam]) {
            urlQuery[defaultSearchParam] = searchParams[defaultSearchParam] 
        }
    }
    return urlQuery
}


// The following functions are used by the toUrlQuery function
// to deal with numbers & dates in search parameters

const numberOperatorValueToSearchParam = (operatorVal: string): string => {
    switch(operatorVal) {
        case '<':
            return "_inf";
        case '<=':
            return "_inf_eg";
        case '>':
            return "_sup";
        case '>=':
            return "_sup_eg";
        default:
            return "";
    }
}

const dateToSearchParam = (date: { day: number, month: number, year: number }, urlQuery: DynamicObject, searchParamName: string) => {
    if('day' in date) {
        urlQuery[searchParamName.replace("date", "jour")] = date.day
    }
    if('month' in date) {
        urlQuery[searchParamName.replace("date", "mois")] = date.month
    }
    if('year' in date) {
        urlQuery[searchParamName.replace("date", "annee")] = date.year
    }
}