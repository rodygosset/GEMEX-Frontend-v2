import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dialog, DialogContent, DialogTrigger } from "./dialog"
import { faSearch } from "@fortawesome/free-solid-svg-icons"
import { cn } from "@utils/tailwind"
import { Button } from "./button"
import SearchFilters from "./search-filters"
import { itemTypes, searchConf } from "@conf/api/search"
import { KeyboardEventHandler, useContext, useEffect, useState } from "react"
import { Context } from "@utils/context"
import Combobox from "./combobox"
import { useRouter } from "next/router"
import { toSearchFiltersObject, toURLQuery } from "@utils/search-utils"

interface Props {
	hiddenItemTypes?: string[]
}

const SearchBar = ({ hiddenItemTypes }: Props) => {
	const { searchParams, setSearchParams, navHistory, setNavHistory, initSearchParamsLoaded } = useContext(Context)

	useEffect(() => {
		if (!searchParams.hasOwnProperty("item") && initSearchParamsLoaded) setSearchParams({ ...searchParams, item: "fiches" })
		if (!initSearchParamsLoaded) setSearchFilters(toSearchFiltersObject(searchParams["item"]?.toString() ?? "fiches", {}))
	}, [])

	useEffect(() => {
		if (!initSearchParamsLoaded) return

		setSearchFilters(toSearchFiltersObject(searchParams["item"]?.toString(), searchParams))
	}, [initSearchParamsLoaded])

	const [searchFilters, setSearchFilters] = useState(toSearchFiltersObject(searchParams["item"]?.toString(), searchParams))

	// search filters life cycle

	// update the filters depending on the item type

	useEffect(() => {
		if (initSearchParamsLoaded) setSearchFilters(toSearchFiltersObject(searchParams["item"]?.toString(), searchParams))
	}, [searchParams["item"]])

	// clear the filters when the clearTrigger changes

	// clear filters trigger

	const [clearTrigger, setClearTrigger] = useState(0)

	const clear = () => setClearTrigger(clearTrigger == 1 ? 2 : 1)

	useEffect(() => {
		if (clearTrigger == 0) return

		setSearchFilters(toSearchFiltersObject(searchParams["item"]?.toString(), {}))
		setSearchParams({ item: searchParams["item"] })
	}, [clearTrigger])

	// update the search params when the filters change

	useEffect(() => {
		// avoid "can't access property of undefined" errors :(
		if (!searchParams["item"] || !initSearchParamsLoaded) return
		// get new URL query
		const newURLQuery = toURLQuery(searchFilters, searchParams, searchParams["item"].toString())

		// only update when the values have changed
		const shouldUpdate = JSON.stringify(newURLQuery) !== JSON.stringify(searchParams)
		if (shouldUpdate) {
			setSearchParams({ ...newURLQuery })
		}
	}, [searchFilters])

	const [dialogIsOpen, setDialogIsOpen] = useState(false)

	// handlers

	const router = useRouter()

	const onSearch = () => {
		if (!searchParams.item || router.pathname == "/search") {
			setDialogIsOpen(false)
			return
		}
		// before pushing to the new url
		// to get the search results
		// push the current url to the nav history
		setNavHistory([...navHistory, router.asPath])
		setDialogIsOpen(false)
		// submit search query
		router.push({
			pathname: "/search",
			query: searchParams
		})
	}

	// utils

	// filter the itemTypes array to remove the item types that are hidden

	const getItemTypes = () => {
		if (!hiddenItemTypes) return itemTypes
		return itemTypes.filter((type) => !hiddenItemTypes.includes(type.value))
	}

	const getDefaultSearchParam = () => {
		if (!searchParams.item) return undefined
		const paramName = searchConf[searchParams.item].defaultSearchParam
		const paramType = searchConf[searchParams.item].searchParams[paramName].type
		return paramType == "text" ? paramName : undefined
	}

	// submit on enter

	const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
		if (e.code == "Enter" || e.code == "NumpadEnter") {
			onSearch()
		}
	}

	// render

	return (
		<Dialog
			open={dialogIsOpen}
			onOpenChange={setDialogIsOpen}>
			<DialogTrigger asChild>
				<button
					className={cn(
						"flex gap-[8px] items-center px-[16px] py-[8px] rounded-[8px] h-[42px] md:w-[200px]",
						"border border-blue-600/10 md:hover:border-blue-600/20",
						"text-sm font-normal text-blue-600 md:text-opacity-60 md:hover:text-blue-600/80 transition-colors duration-300 ease-in-out",
						"md:shadow-2xl md:shadow-blue-600/20 transition-shadow duration-300 ease-in-out",
						"max-md:hover:bg-blue-600/10"
					)}>
					<FontAwesomeIcon icon={faSearch} />
					<span className="max-md:hidden w-full text-left whitespace-nowrap overflow-hidden text-ellipsis">
						{getDefaultSearchParam()
							? searchParams[getDefaultSearchParam() as string]
								? searchParams[getDefaultSearchParam() as string]
								: "Rechercher..."
							: "Rechercher..."}
					</span>
				</button>
			</DialogTrigger>
			<DialogContent
				className={cn(
					"max-w-screen-sm max-sm:bottom-0 bg-neutral-50/40 backdrop-blur-3xl",
					"ring-4 ring-blue-600/30 flex flex-col",
					"sm:max-h-[600px] flex flex-col h-full max-h-[80vh]",
					"max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0"
				)}>
				{getDefaultSearchParam() ? (
					<div className={cn("w-full flex items-center gap-[8px] p-[16px] h-[64px] rounded-t-[8px]", "border-b border-blue-600/10")}>
						<FontAwesomeIcon
							icon={faSearch}
							className="text-sm text-blue-600"
						/>
						<input
							className={cn("w-full bg-transparent focus:outline-none", "text-sm font-normal text-blue-600", "placeholder:text-blue-600/60")}
							onKeyDown={handleKeyDown}
							value={searchParams[getDefaultSearchParam() as string] ?? ""}
							onChange={(e) =>
								setSearchParams({
									...searchParams,
									[getDefaultSearchParam() as string]: e.target.value
								})
							}
							placeholder="Rechercher..."
						/>
					</div>
				) : (
					<></>
				)}
				<div className="w-full flex-1 min-h-0 flex flex-col gap-[24px] p-[16px]">
					<div className="w-full flex flex-col gap-[16px]">
						<label className="text-sm font-medium text-blue-600/60">Faire une recherches sur les</label>
						<Combobox
							className="w-full"
							options={getItemTypes()}
							onChange={(selectedItemType) => {
								setSearchParams({
									...searchParams,
									item: selectedItemType.value
								})
							}}
							selected={getItemTypes().find((itemType) => itemType.value == searchParams.item)}
						/>
					</div>
					<div className="w-full flex-1 min-h-0 flex flex-col gap-[16px] h-full">
						<label className="text-sm font-medium text-blue-600/60">Filtres</label>
						<SearchFilters
							searchFilters={searchFilters}
							setSearchFilters={setSearchFilters}
						/>
					</div>
					<div className="w-full flex items-center gap-[16px]">
						<Button
							onClick={clear}
							className="flex-1"
							variant="outline">
							Effacer
						</Button>
						<Button
							onClick={onSearch}
							className="flex-1">
							Rechercher
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default SearchBar
