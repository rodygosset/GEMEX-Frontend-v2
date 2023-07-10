import useAPIRequest from "@hook/useAPIRequest";
import { capitalizeEachWord } from "@utils/general";
import { SelectOption } from "@utils/react-select/types";
import { AxiosError, AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { StylesConfig } from "react-select";
import Select from "./select";
import colors from "@styles/abstracts/_colors.module.scss"
import { useSession } from "next-auth/react";
import { MySession } from "@conf/utility-types";

interface Props {
    name: string;
    itemType: string;
    defaultValue?: string[];
    selected: string[];
    fullWidth?: boolean;
    customStyles?: StylesConfig;
    bigPadding?: boolean;
    row?: boolean;
    onChange: (newVal: string[]) => void;
}

const ItemMultiSelect = (
    {
        name,
        itemType,
        defaultValue,
        selected,
        fullWidth,
        customStyles,
        bigPadding,
        row,
        onChange
    }: Props
) => {

    // state

    const [options, setOptions] = useState<SelectOption[]>([])
    
    const [isLoading, setIsLoading] = useState(true)

    // Fetch the data from the API 
    // & convert it into a list of options

    const makeAPIRequest = useAPIRequest()

    const session = useSession().data as MySession | null

    useEffect(() => {

        if(!session) return

        // start with making a request to the API

        const handleReqSucess = (res: AxiosResponse<any[]>) => {
            setIsLoading(false)
            // convert the array of objects into an array of select options

            if(!Array.isArray(res.data) || res.data.length == 0) { return }


            // get the object property we'll use as the label
            let mainAttr = '';
            if('username' in res.data[0]) { mainAttr = 'username' }
            else if('titre' in res.data[0]) { mainAttr = 'titre' }
            else if('nom' in res.data[0]) { mainAttr = 'nom' }
            else { mainAttr = 'id' }

            setOptions(res.data.map(item => {
                // if our options are users
                // display their full name
                let optionLabel: string = item[mainAttr]
                if(mainAttr == 'username') {
                    optionLabel = capitalizeEachWord(item['prenom'] + ' ' + item['nom'])
                }
                return { value: item.id, label: optionLabel }
            }))
        }

        // in case there was an error with our request

        const handleReqFailure = (res: Error | AxiosError<unknown, any>) => {
            setIsLoading(false)
        }

        // make our API request

        makeAPIRequest(
            session,
            "get",
            itemType,
            undefined,
            undefined,
            handleReqSucess,
            handleReqFailure,
        )

    }, [session])

    // render

    return (
        <Select
            name={name}
            options={options}
            isLoading={isLoading}
            defaultValue={defaultValue}
            value={selected}
            onChange={onChange}
            isMulti
            large={!fullWidth}
            bigPadding={bigPadding}
            customStyles={customStyles}
            row={row}
        />
    )

}

export default ItemMultiSelect