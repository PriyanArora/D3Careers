export default function EmptyState() {
  return (
    <div className="mt-8 rounded-3xl border-[3px] border-black bg-white p-8 text-center shadow-[8px_8px_0_#000]">
      <p className="font-['Epilogue'] text-[34px] font-black uppercase leading-tight text-black">
        No matching pathways found
      </p>
      <p className="mx-auto mt-3 max-w-160 text-[18px] leading-relaxed text-[#646464]">
        Try changing major, background, or depth to explore more alumni transitions.
      </p>
    </div>
  )
}