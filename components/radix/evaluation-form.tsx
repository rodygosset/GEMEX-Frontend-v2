import { Evaluation } from "@conf/api/data-types/quality-module"
import { useState } from "react"
import { cn } from "@utils/tailwind"
import { Dialog, DialogContent } from "./dialog"

interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
	evaluation: Evaluation
	onSubmit: (evaluation: Evaluation) => void
}

const EvaluationForm = ({ open, onOpenChange }: Props) => {
	const [currentTab, setCurrentTab] = useState("intro")

	// render
	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent className={cn("w-full sm:max-w-[600px] max-h", "max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0")}></DialogContent>
		</Dialog>
	)
}

export default EvaluationForm
