import { Fragment, useEffect, useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./command"
import { Popover, PopoverContentScroll, PopoverTrigger } from "./popover"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons"
import useAPIRequest from "@hook/useAPIRequest"
import { useSession } from "next-auth/react"
import { MySession } from "@conf/utility-types"
import { AxiosError, AxiosResponse } from "axios"
import { capitalizeEachWord } from "@utils/general"
import { SelectOption } from "@utils/react-select/types"
import { ControllerRenderProps } from "react-hook-form"
import { ScrollArea } from "./scroll-area"

interface Props {
    itemType: string;
    searchParams?: any;
    onChange: (value: number) => void;
    field: ControllerRenderProps<any, any>;
    selected?: number;
}

const ItemComboBox = (
    {
        itemType,
        searchParams,
        onChange,
        field,
        selected
    }: Props
) => {


    const [isOpen, setIsOpen] = useState(false) 
    const [isLoading, setIsLoading] = useState(true)
    const [options, setOptions] = useState<SelectOption<number>[]>([])

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

            if(!Array.isArray(res.data)) { return }

            if(res.data.length == 0) setOptions([ { value: 0, label: "Sélectionner..." } ])


            // get the object property we'll use as the label
            let mainAttr = '';
            if('username' in res.data[0]) { mainAttr = 'username' }
            else if('titre' in res.data[0]) { mainAttr = 'titre' }
            else if('nom' in res.data[0]) { mainAttr = 'nom' }
            else { mainAttr = 'id' }

            const selectOptions = res.data.map(item => {
                // if our options are users
                // display their full name
                let optionLabel: string = item[mainAttr]
                if(mainAttr == 'username') {
                    optionLabel = capitalizeEachWord(item['prenom'] + ' ' + item['nom'])
                }
                return { value: item.id, label: optionLabel }
            })

            setOptions([ { value: 0, label: "Sélectionner..." }, ...selectOptions ])
        }

        // in case there was an error with our request

        const handleReqFailure = (res: Error | AxiosError<unknown, any>) => {
            setIsLoading(false)
        }

        // make our API request

        searchParams ?
        makeAPIRequest(
            session,
            "post",
            itemType,
            "search/",
            searchParams,
            handleReqSucess,
            handleReqFailure,
        )
        :
        makeAPIRequest(
            session,
            "get",
            itemType,
            undefined,
            undefined,
            handleReqSucess,
            handleReqFailure,
        )

    }, [session, searchParams])    


    useEffect(() => console.log(`selected: ${selected}`), [selected])

    const getLabel = () => {
        if(selected) return options.find(option => option.value == selected)?.label ?? "Sélectionner..."
        else if(field.value) return options.find(option => option.value == field.value)?.label ?? "Sélectionner..."
        else return "Sélectionner..."
    }


    // render


    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <button 
                    role="combobox"
                    className={`flex flex-row justify-between items-center gap-4 px-[16px] py-[8px] rounded-[8px] w-full
                                bg-primary/10 text-left overflow-hidden overflow-ellipsis
                                text-sm ${!field.value && !selected ? "text-primary/60" : "text-primary"} `}>
                {
                    getLabel()
                }
                <FontAwesomeIcon icon={faChevronDown} className="text-primary" />
                </button>
            </PopoverTrigger>
            <PopoverContentScroll className="w-[250px] p-0">
                <Command>
                    <CommandInput placeholder="Rechercher..." />
                    <ScrollArea className="flex max-h-[280px] flex-col gap-4">
                        <CommandEmpty>
                            Aucun résultat
                        </CommandEmpty>
                        <CommandGroup>
                            
                            {
                                options.map((option) => (
                                    <Fragment key={option.value}>
                                        <CommandItem 
                                            className="flex flex-row justify-between items-center"
                                            onSelect={currentValue => {
                                                const option = options.find(option => option.label.toLowerCase() == currentValue)
                                                if(option) {
                                                    setIsOpen(false)
                                                    onChange(option.value)
                                                }
                                            }}
                                        >
                                            {option.label}
                                            {
                                                (selected && option.value == selected && selected != 0) ||
                                                (option.value == field.value && field.value != 0) ?
                                                <FontAwesomeIcon icon={faCheck} className="text-primary" />
                                                : <></>
                                            }
                                        </CommandItem>
                                    </Fragment>
                                ))
                            }
                        </CommandGroup>
                    </ScrollArea>
                </Command>
            </PopoverContentScroll>
        </Popover>
    )
}

export default ItemComboBox