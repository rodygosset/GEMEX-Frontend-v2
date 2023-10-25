interface Props {
	grade: string
	count: number
	onChange: (count: number) => void
}

const GradeCountInput = ({ grade, count, onChange }: Props) => {
	return (
		<div className="flex items-start">
			<span className="h-[54px] flex items-center justify-center text-xl font-semibold text-blue-600 p-[16px] rounded-[8px] border border-blue-600/20">
				{grade}
			</span>
		</div>
	)
}

export default GradeCountInput
