export default function DashboardPage() {
  return (
    <section className="pt-10">
      <div className="rounded-[28px] border-[3px] border-black bg-[#dff5ef] p-6 shadow-[9px_9px_0_#000] sm:p-8" data-reveal>
        <p className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-[#5f5f5f]">Dashboard</p>
        <h1 className="mt-4 font-['Epilogue'] text-[48px] font-black uppercase leading-[0.95] tracking-[-0.04em] text-black">
          Your D3Careers hub
        </h1>
        <p className="mt-4 max-w-190 text-[18px] leading-relaxed text-[#656565]">
          Track your saved pathways, booking history, and personalized career insights in one place.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border-[3px] border-black bg-white p-6 shadow-[7px_7px_0_#000]" data-reveal>
          <p className="font-['Epilogue'] text-[32px] font-black leading-tight text-black">Saved Pathways</p>
          <p className="mt-3 text-[17px] text-[#666666]">
            Save promising major-to-role journeys so you can revisit and compare them later.
          </p>
        </article>
        <article className="rounded-3xl border-[3px] border-black bg-white p-6 shadow-[7px_7px_0_#000]" data-reveal>
          <p className="font-['Epilogue'] text-[32px] font-black leading-tight text-black">Mentor Sessions</p>
          <p className="mt-3 text-[17px] text-[#666666]">
            Keep session prep and follow-ups organized as you progress through your roadmap.
          </p>
        </article>
      </div>
    </section>
  )
}