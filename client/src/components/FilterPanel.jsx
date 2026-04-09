export default function FilterPanel({filters, onChange}){
  return(
    <div className="rounded-3xl border-[3px] border-black bg-[#f8d6b3] p-5 shadow-[8px_8px_0_#000] sm:p-6">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-black">Major</span>
          <select
            value={filters.major}
            onChange={(e) => onChange({ ...filters, major: e.target.value })}
            className="h-12 rounded-full border-[3px] border-black bg-white px-4 text-[16px] outline-none"
          >
            <option value="">All Majors</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Business Administration">Business Administration</option>
            <option value="Accounting / Finance">Accounting / Finance</option>
            <option value="Nursing / Health Sciences">Nursing / Health Sciences</option>
            <option value="Biology">Biology</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Psychology">Psychology</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-black">Background</span>
          <select
            value={filters.background}
            onChange={(e) => onChange({ ...filters, background: e.target.value })}
            className="h-12 rounded-full border-[3px] border-black bg-white px-4 text-[16px] outline-none"
          >
            <option value="">All Backgrounds</option>
            <option value="firstGen">First Generation</option>
            <option value="transfer">Transfer</option>
            <option value="international">International</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-black">Depth</span>
          <select
            value={filters.depth}
            onChange={(e) => onChange({ ...filters, depth: e.target.value })}
            className="h-12 rounded-full border-[3px] border-black bg-white px-4 text-[16px] outline-none"
          >
            <option value="full">Full Path</option>
            <option value="3">3 Levels</option>
            <option value="2">2 Levels</option>
          </select>
        </label>
      </div>
    </div>
  )
}