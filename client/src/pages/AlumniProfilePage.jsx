import { useState, useEffect} from "react"
import SoftAuthGate from "../components/SoftAuthGate"
import { useParams } from "react-router-dom"
import api from "../api"
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'
import ErrorBanner from '../components/UI/ErrorBanner'

export default function AlumniProfilePage() {
  const {id} = useParams()
  const [error, setError] = useState(null)
  const [alumni, setAlumni] = useState(null)

  useEffect(() => {
    async function fetchAlumni() {
      try {
        const res = await api.get(`/api/alumni/${id}`)
        setAlumni(res.data)
      } catch (error) {
        console.error({ cause: error }, 'failed to fetch alumni profile')
        setError("Couldn't fetch Alumni")
      }
    }

    fetchAlumni()
  }, [id])

  return (
    <section className="pt-10">
      <ErrorBanner message={error} />

      <div className="rounded-[28px] border-[3px] border-black bg-[#f8d6b3] p-6 shadow-[9px_9px_0_#000] sm:p-8" data-reveal>
        <p className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-[#575757]">Alumni profile</p>
        <h1 className="mt-4 font-['Epilogue'] text-[48px] font-black uppercase leading-[0.95] tracking-[-0.04em] text-black">
          {alumni?.name || 'Loading profile'}
        </h1>
        <p className="mt-3 text-[22px] font-semibold text-black">{alumni?.currentRole || 'Current role unavailable'}</p>
        <p className="text-[18px] text-[#5f5f5f]">{alumni?.currentCompany || 'Current company unavailable'}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {alumni?.major && (
            <span className="rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-semibold text-black">
              {alumni.major}
            </span>
          )}
          {alumni?.backgroundTags?.map((tag) => (
            <span key={tag} className="rounded-full border-2 border-black bg-[#dff5ef] px-4 py-2 text-sm font-semibold text-black">
              {tag}
            </span>
          ))}
        </div>

        {alumni?.bio && <p className="mt-6 max-w-220 text-[18px] leading-relaxed text-[#646464]">{alumni.bio}</p>}

        <div className="mt-8">
          <SoftAuthGate>
            <Button 
              size="lg"
              onClick={() => {
                window.open('https://cal.com/priyanarora/30min', '_blank')
              }}
            >
              Schedule Chat
            </Button>
          </SoftAuthGate>
        </div>
      </div>

      <div className="mt-10 grid gap-5" data-reveal>
        {alumni?.careerTimeline?.map((person, index) => (
          <Card key={`${person.title}-${person.startYear}-${index}`}>
            <p className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-[#646464]">Stage {index + 1}</p>
            <p className="mt-2 font-['Epilogue'] text-[32px] font-black leading-tight text-black">{person.title}</p>
            <p className="mt-1 text-[18px] text-[#626262]">{person.company}</p>
            <p className="text-[16px] text-[#676767]">{person.industry}</p>
            <p className="mt-3 text-[16px] text-black">{person.startYear} - {person.endYear || 'Present'}</p>
            {!!person.skillsGained?.length && (
              <div className="mt-4 flex flex-wrap gap-2">
                {person.skillsGained.map((skill) => (
                  <span key={skill} className="rounded-full border-2 border-black bg-[#f7de5a] px-3 py-1 text-sm font-semibold text-black">
                    {skill}
                  </span>
                ))}
              </div>
            )}
            {person.adviceForSelf && (
              <p className="mt-4 rounded-2xl border-2 border-black bg-[#fff9db] p-4 text-[17px] leading-relaxed text-[#4f4f4f]">
                {person.adviceForSelf}
              </p>
            )}
          </Card>
        ))}
      </div>
    </section>
  )
}