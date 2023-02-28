

export const itemTypetoAttributeName = (type: string) => {
    return toSingular(type).toLowerCase().replace(' ', '_') + '_id'
}

export const toSingular = (itemType: string) => {
    const tokens = itemType.split('_')
    const toRemove = ['s', 'x']
    const isPluralWord = (word: string) => toRemove.includes(word[word.length-1])
    const itemTypeSingular = tokens.map(word => {
        return isPluralWord(word) ? word.substring(0, word.length-1) : word
    }).join(' ')
    return capitalizeEachWord(itemTypeSingular)
}

export const formatItemName = (name: string) => {
    const asArray = name.split(' ')
    asArray[0] = asArray[0].charAt(0).toUpperCase() + asArray[0].substring(1);
    return asArray.map(val => {
        const toRemove = ['s', 'x']
        if(toRemove.includes(val[val.length - 1])) {
            return val.substring(0, val.length-1)
        } else {
            return val
        }
    }).join(' ')
}

export const formatPermissionName = (name: string) => {
    const asArray = name.split(' ')
    asArray[0] = asArray[0].charAt(0).toUpperCase() + asArray[0].substring(1);
    return asArray.map(val => {
        if(val.includes('_')) {
            let valAsArray = val.split('_')
            return valAsArray.map((value) => {
                return value.charAt(0).toUpperCase() + value.substring(1);
            }).join(' ')
        }
        return val
    }).join(' ')
}

export const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export const capitalizeEachWord = (str: string) => {
    return str.split(' ').map(capitalizeFirstLetter).join(' ')
}

export const toISO = (date: Date) => {
    const tmp = new Date()
    tmp.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
    return tmp.toISOString().split('T')[0]
}


export const frenchToISO = (date: string) => date.split('/').reverse().join('-')

export const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }