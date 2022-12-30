import { User } from "@conf/api/data-types/user"
import { fas } from "@fortawesome/free-solid-svg-icons";
import { getClassNameForExtension } from 'font-awesome-filetypes'
import { capitalizeEachWord } from "utils/general";

export interface Fichier {
    nom: string;
    user_id: number;
    id: number;
    modifications: string;
}


export const destructFileName = (apiFileName: string, owner: User) => {
    let author: string = owner.username
    let fileName: string = ''
    let extension: string = ''
    let count: string = ''

    let tmpFileName: string = apiFileName

    // cut out the author's name

    if(apiFileName.slice(0, owner.username.length).includes(owner.username)) {
        tmpFileName = apiFileName.slice(owner.username.length + 1)
    } 

    const asArray = tmpFileName.split('_')

    // the count is always the last element of the split array
    // but we also need to cut out the file extension

    count = asArray[asArray.length-1].split('.')[0]

    // get the extension

    if(asArray[asArray.length-1].split('.').length > 1) {
        const length = asArray[asArray.length-1].split('.').length
        extension = asArray[asArray.length-1].split('.')[length - 1]
    }

    fileName = asArray.slice(0, asArray.length-1).join('_') + '.' + extension

    return [author, fileName, extension, count]
}

export const FAClassNameToIconName = (className: string) => {
    const asArray = className.split('-')
    let iconName = asArray[0]
    if(asArray.length > 1) {
        let tmp = asArray.slice(1).join(' ')
        iconName += capitalizeEachWord(tmp).replace(' ', '')
    }
    return iconName
}

export const getFileOwner = (fichier: Fichier, owner: User) => {
    const [author] = destructFileName(fichier.nom, owner)
    return author
}

export const getFileName = (fichier: Fichier, owner: User) => {
    const [, fileName] = destructFileName(fichier.nom, owner)
    return fileName
}

export const getFileExtension = (fichier: Fichier, owner: User) => {
    const[, , extension] = destructFileName(fichier.nom, owner)
    return extension
}

export const getFileCount = (fichier: Fichier, owner: User) => {
    const [, , , count] = destructFileName(fichier.nom, owner)
    return Number(count)
}



export const getFileIcon = (fichier: Fichier, owner: User) => {
    const iconClassName = getClassNameForExtension(getFileExtension(fichier, owner))
    const iconName = FAClassNameToIconName(iconClassName)
    return fas[iconName]
}
