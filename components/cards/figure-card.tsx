import { FigureCardType } from "@conf/utility-types"
import { faArrowRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { cn } from "@utils/tailwind"
import Link from "next/link"

interface Props {
	className?: string
	figureCard: FigureCardType
}

const FigureCard = ({ className, figureCard }: Props) => {
	// render

	return (
		<article
			className={cn(
				"w-[320px] min-w-[320px] h-[200px] rounded-[8px]",
				"p-[32px] flex flex-col gap-4",
				`bg-gradient-to-br ${figureCard.color}`,
				className
			)}>
			<div className="w-full flex items-center gap-4">
				<FontAwesomeIcon
					icon={figureCard.icon}
					className="text-2xl text-neutral-50/80"
				/>
				<span className="text-sm font-medium text-neutral-50/80 w-full">{figureCard.title}</span>
				<Link
					className={cn(
						"w-[48px] aspect-square h-[48px] rounded-full flex items-center justify-center",
						"text-base text-neutral-50",
						"border border-neutral-50/20",
						"hover:bg-neutral-50/10"
					)}
					href={figureCard.link}>
					<FontAwesomeIcon icon={faArrowRight} />
				</Link>
			</div>
			<div className="w-full flex flex-col">
				<span className="font-bold text-4xl text-neutral-50 leading-none">{figureCard.value ?? 0}</span>
				<span className="text-sm font-normal text-neutral-50/60">{figureCard.caption}</span>
			</div>
		</article>
	)
}

export default FigureCard
