export default function LoadingSkeleton() {
  return (
    <div className="mt-8 rounded-3xl border-[3px] border-black bg-white p-6 shadow-[8px_8px_0_#000]">
      <div className="space-y-4">
        <div className="h-6 w-1/3 animate-pulse rounded-full bg-[#ece7e8]" />
        <div className="h-105 w-full animate-pulse rounded-[20px] border-2 border-black bg-[#f3f0f1]" />
      </div>
    </div>
  )
}