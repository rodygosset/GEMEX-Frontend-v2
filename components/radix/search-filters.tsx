import BooleanFilter from "@components/search-filters/boolean-filter"
import DateFilter from "@components/search-filters/date-filter"
import MultiSelectFilter from "@components/search-filters/multi-select-filter"
import NumericFilter from "@components/search-filters/numeric-filter"
import SelectFilter from "@components/search-filters/select-filter"
import TextFilter from "@components/search-filters/text-filter"
import TimeDeltaFilter from "@components/search-filters/time-delta-filter"
import { apiURLs } from "@conf/api/conf"
import { Context } from "@utils/context"
import { defaultOperator, hasNumberOperatorParam } from "@utils/form-elements/time-delta-input"
import { useContext } from "react"
import { ScrollArea } from "./scroll-area"
import { SearchFilters } from "@conf/api/search"

interface Props {
	className?: string
	searchFilters: SearchFilters
	setSearchFilters: (searchFilters: SearchFilters) => void
}

const SearchFilters = ({ className, searchFilters, setSearchFilters }: Props) => {
	const { searchParams } = useContext(Context)

	// handlers

	// handle updating the search filters's state from here
	// & pass these two functions to the filter components

	const handleFilterValueChange = (filterName: string, newValue: any) => {
		let newSearchFilters = { ...searchFilters }
		newSearchFilters[filterName].value = newValue
		setSearchFilters(newSearchFilters)
	}

	const handleFilterCheckedToggle = (filterName: string, checked: boolean) => {
		let newSearchFilters = { ...searchFilters }
		newSearchFilters[filterName].checked = checked
		setSearchFilters(newSearchFilters)
	}

	// utils for time delta & number inputs

	const getOperatorValue = (filterName: string) => {
		// fool-proofing
		if (!hasNumberOperatorParam(filterName, searchParams["item"]?.toString())) return defaultOperator
		return searchFilters[filterName + "_operator"].value
	}

	const setOperatorValue = (filterName: string, operatorValue: string) => {
		if (!hasNumberOperatorParam(filterName, searchParams["item"]?.toString())) return
		handleFilterValueChange(filterName + "_operator", operatorValue)
	}

	// render

	return (
		<ScrollArea className="w-full max-h-[450px] min-h-0 flex flex-col">
			<div className="flex flex-col gap-[24px] w-full flex-1 min-h-0">
				{
					// Generate the form
					// for each SearchFilter
					// render a component according to its type
					Object.keys(searchFilters).map((filterName) => {
						const filter = searchFilters[filterName]
						const { conf } = filter

						// DRY
						const filterProps = {
							name: filterName,
							filter: filter,
							onChange: handleFilterValueChange,
							onToggle: handleFilterCheckedToggle
						}

						switch (conf.type) {
							case "text":
								// text input
								return (
									<TextFilter
										key={filterName}
										{...filterProps}
									/>
								)
							case "boolean":
								// checkbox
								return (
									<BooleanFilter
										key={filterName}
										{...filterProps}
									/>
								)
							case "number":
								// numeric input
								return (
									<NumericFilter
										key={filterName}
										{...filterProps}
										getOperatorValue={getOperatorValue}
										setOperatorValue={setOperatorValue}
									/>
								)
							case "date":
								// date input
								return (
									<DateFilter
										key={filterName}
										{...filterProps}
									/>
								)
							case "timeDelta":
								// filter representing an amount of time
								return (
									<TimeDeltaFilter
										key={filterName}
										{...filterProps}
										getOperatorValue={getOperatorValue}
										setOperatorValue={setOperatorValue}
									/>
								)
							case "itemList":
								// multi select
								if (!conf.item || !(conf.item in apiURLs)) {
									break
								}
								return (
									<MultiSelectFilter
										key={filterName}
										{...filterProps}
									/>
								)
							default:
								// select
								if (!(conf.type in apiURLs)) {
									break
								}
								return (
									<SelectFilter
										key={filterName}
										{...filterProps}
									/>
								)
						}
					})
				}
			</div>
		</ScrollArea>
	)
}

export default SearchFilters
