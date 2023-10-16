import { Skeleton } from "./skeleton"

const FileSkeleton = () => (
	<li className="w-full">
		<Skeleton className="w-full h-[64px] rounded-[8px] mb-[8px] flex gap-[16px] items-center p-[16px]">
			<Skeleton className="w-[32px] h-[32px] rounded-[8px]" />
			<div className="flex-1 h-full flex flex-col gap-[8px]">
				<Skeleton className="w-[200px] h-[12px] rounded-full" />
				<Skeleton className="w-[100px] h-[12px] rounded-full opacity-60" />
			</div>
		</Skeleton>
	</li>
)

export default FileSkeleton
