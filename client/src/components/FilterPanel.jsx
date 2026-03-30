export default function FilterPanel({filters, onChange}){
  return(
    <div>

      {/*Here we make the dropdown, e is any browser action on the dropdown i.e on the options, ...filters mean all filters remain unchanged, major: e.target.value changes only the major everything else same due to ...filters*/}                                                                                                                                                            
      <select value={filters.major} onChange = {e => onChange({ ...filters, major: e.target.value })} >
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

      {/*similar as above, only background change*/}
      <select value={filters.background} onChange = {e => onChange({ ...filters, background: e.target.value })} >
        <option value="">All Backgrounds</option>
        <option value="firstGen">First Generation</option>
        <option value="transfer">Transfer</option>
        <option value="international">International</option>
      </select>

      {/*same as above, ***got to add more levels options*/}
      <select value={filters.depth} onChange = {e => onChange({ ...filters, depth: e.target.value })}>
        <option value="full">Full Path</option>
        <option value="2">2 Levels</option>
      </select>
    </div>
  )
}