import { cn } from "@utils/tailwind"
import { Dialog, DialogContent } from "./dialog"

interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
}

const FilePicker = ({ open, onOpenChange }: Props) => {
	// render

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"max-h-[90vh] w-screen sm:w-full sm:max-w-[90vw] max-sm:max-w-full p-[32px] pt-[64px]",
					"flex flex-col gap-[16px]",
					"max-sm:top-auto max-sm:bottom-0 max-sm:translate-y-0"
				)}>
				hello
			</DialogContent>
		</Dialog>
	)
}

export default FilePicker
