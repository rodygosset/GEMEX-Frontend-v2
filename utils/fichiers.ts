import { getClassNameForExtension } from 'font-awesome-filetypes'
import { User } from "@conf/api/data-types/user"
import { capitalizeEachWord } from './general'
import { fas, IconDefinition } from '@fortawesome/free-solid-svg-icons'


export interface FileInfo {
    fileName: string;
    extension: string;
    author: string;
    count: number;
    icon: IconDefinition;
}

// files stored in our API have file names that contain info
// this function takes the file name & extracts this info


export const destructFileName = (apiFileName: string, owner: User) => {
    let author: string = owner.username
    let fileName: string = ''
    let extension: string = ''
    let count: number = 0

    let tmpFileName: string = apiFileName

    // cut out the author's name

    if(apiFileName.slice(0, owner.username.length).includes(owner.username)) {
        tmpFileName = apiFileName.slice(owner.username.length + 1)
    } 

    const asArray = tmpFileName.split('_')

    // the count is always the last element of the split array
    // but we also need to cut out the file extension

    count = Number(asArray[asArray.length-1].split('.')[0])

    // get the extension

    if(asArray[asArray.length-1].split('.').length > 1) {
        const length = asArray[asArray.length-1].split('.').length
        extension = asArray[asArray.length-1].split('.')[length - 1]
    }

    fileName = asArray.slice(0, asArray.length-1).join('_') + '.' + extension

    let icon = getFileIcon(fileName, owner, extension)

    return { author, fileName, extension, count, icon } as FileInfo
}

// export const getFileOwner = (fileName: string, owner: User) => {
//     const [author] = destructFileName(fileName, owner)
//     return author
// }

// export const getFileName = (fileName: string, owner: User) => {
//     const [, originalFileName] = destructFileName(fileName, owner)
//     return originalFileName
// }

// export const getFileExtension = (fileName: string, owner: User) => {
//     const[, , extension] = destructFileName(fileName, owner)
//     return extension
// }

// export const getFileCount = (fileName: string, owner: User) => {
//     const [, , , count] = destructFileName(fileName, owner)
//     return Number(count)
// }

// the two following utility functions 
// are used by the FileCard component to get the correct icon
// for the current file's extension

export const FAClassNameToIconName = (className: string) => {
    const asArray = className.split('-')
    let iconName = asArray[0]
    if(asArray.length > 1) {
        let tmp = asArray.slice(1).join(' ')
        iconName += capitalizeEachWord(tmp).replace(' ', '')
    }
    return iconName
}



export const getFileIcon = (fileName: string, owner: User, extension: string) => {
    const iconClassName = getClassNameForExtension(extension)
    const iconName = FAClassNameToIconName(iconClassName)
    return fas[iconName]
}