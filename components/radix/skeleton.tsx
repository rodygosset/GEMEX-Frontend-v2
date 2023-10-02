import { cn } from "@utils/tailwind"


function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[8px] bg-blue-600/20", className)}
      {...props}
    />
  )
}

export { Skeleton }
