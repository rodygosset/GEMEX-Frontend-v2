import Select from "@components/form-elements/select";
import { getUserFullName } from "@conf/api/data-types/user";
import { MySession } from "@conf/utility-types";
import useAPIRequest from "@hook/useAPIRequest";
import { SelectOption } from "@utils/react-select/types";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";


interface Props {
    itemType: string;
    name: string;
    value: any;
    isInErrorState?: boolean;
    onSelect: (value: string | number | string[]) => void
}

const ItemSelectField = (
    {
        itemType,
        name,
        value,
        isInErrorState,
        onSelect
    }: Props
) => {

    // state
    
    const [selectOptions, setSelectOptions] = useState<SelectOption[]>([])


    // get the select options
    // by making a call to our backend API

    const makeAPIRequest = useAPIRequest()

    const session = useSession().data as MySession | null

    useEffect(() => {
        
        if (!session) return

        makeAPIRequest<any[], void>(
            session,
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

    }, [itemType, session])

    // render

    return (
        <Select
            name={name}
            options={selectOptions}
            value={value}
            onChange={onSelect}
            isInErrorState={isInErrorState}
        />
    )
}

export default ItemSelectField