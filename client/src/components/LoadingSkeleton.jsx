export default function LoadingSkeleton() {
  return (
    <div className="mt-8 rounded-3xl border-[3px] border-black bg-white p-6 shadow-[8px_8px_0_#000]">
      <div className="space-y-5">
        <div>
          <p className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-[#6a6a6a]">
            Loading pathways
          </p>
          <p className="mt-3 font-['Epilogue'] text-[28px] font-black uppercase leading-tight text-black sm:text-[34px]">
            Waking the career map
          </p>
          <p className="mt-2 max-w-170 text-[16px] leading-relaxed text-[#666666]">
            Free Render can take a moment to wake up. The diagram will appear as soon as the backend responds.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border-[3px] border-black bg-[#f7f3f4] p-4">
          <div className="relative h-12 w-12 shrink-0 rounded-full border-[3px] border-black bg-white">
            <div className="absolute inset-[5px] animate-spin rounded-full border-[4px] border-[#f8d6b3] border-t-[#111111]" />
          </div>
          <p className="text-[15px] font-semibold text-[#4f4f4f]">
            Syncing live pathway data from the backend.
          </p>
        </div>

        <div className="space-y-4">
          <div className="h-6 w-1/3 animate-pulse rounded-full bg-[#ece7e8]" />
          <div className="h-105 w-full animate-pulse rounded-[20px] border-2 border-black bg-[#f3f0f1]" />
        </div>
      </div>
    </div>
  )
}
