import { Skeleton } from "@/components/ui/skeleton";

export default function ScheduleLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-36" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex min-w-[800px]">
          <Skeleton className="h-12 w-32 shrink-0" />
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <Skeleton key={d} className="h-12 flex-1" />
          ))}
        </div>
        <div className="flex min-w-[800px]">
          <Skeleton className="h-16 w-32 shrink-0" />
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <Skeleton key={d} className="h-16 flex-1" />
          ))}
        </div>
      </div>
    </div>
  );
}
