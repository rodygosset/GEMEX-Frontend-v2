import Select from "@components/form-elements/select";
import { getUserFullName } from "@conf/api/data-types/user";
import useAPIRequest from "@hook/useAPIRequest";
import { SelectOption } from "@utils/react-select/types";
import { useEffect, useState } from "react";


interface Props {
    itemType: string;
    name: string;
    value: any;
    onSelect: (value: string | number | string[]) => void
}

const ItemSelectField = (
    {
        itemType,
        name,
        value,
        onSelect
    }: Props
) => {

    // state
    
    const [selectOptions, setSelectOptions] = useState<SelectOption[]>([])

    // get the select options
    // by making a call to our backend API

    const makeAPIRequest = useAPIRequest()

    useEffect(() => {
        
        makeAPIRequest<any[], void>(
            "get",
            itemType,
            undefined,
            undefined,
            res => setSelectOptions(res.data.map(item => {
                // build a select option object from each item
                // account for users
                const itemLabel = itemType == "users" ? getUserFullName(item) : item.nom
                return { value: item.id, label: itemLabel }
            }))
        )

    }, [itemType])

    // render

    return (
        <Select
            name={name}
            options={selectOptions}
            value={value}
            onChange={onSelect}
        />
    )
}

export default ItemSelectField