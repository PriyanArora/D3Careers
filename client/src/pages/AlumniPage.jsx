import api from "../api"
import { withRetry } from "../api"
import { useState, useEffect } from "react"
import {Link} from "react-router-dom"
import Card from '../components/UI/Card'

export default function AlumniPage() {
  const [alumni, setAlumni] = useState([])
  const [error, setError] = useState(null)
  const [onlineIds, setOnlineIds] = useState(new Set())

  useEffect(()=>{
    async function getAlumni(){
      try{
        const res = await withRetry(() => api.get("/api/alumni"))
        const alumniData = Array.isArray(res.data) ? res.data : (res.data?.alumni || [])
        setAlumni(alumniData)
      }
      catch(error){
        setError("Alumni couldn't get fetched: " + error.message)
      }
    }
    getAlumni()
  }, [])

  useEffect(() => {
    async function getOnlineAlumni() {
      try{
        const res = await withRetry(() => api.get("/api/alumni/online"))
        setOnlineIds(new Set(res.data)) 
      }
      catch(error){
        setError("Online alumni couldn't get fetched: " + error.message)
      }
    }
    const id = setInterval(() => getOnlineAlumni(), 30000) //fetch online status every 30 seconds
    getOnlineAlumni()
    return () => clearInterval(id) //cleanup function to clear the interval when component unmounts
  }, [])

  return(
    <section className="pt-10">
      <div className="mx-auto max-w-245 text-center" data-reveal>
        <h1 className="mt-6 font-['Epilogue'] text-[38px] font-black uppercase leading-[0.98] tracking-[-0.04em] text-black sm:text-[58px]">
          Meet mentors who
          <br />
          walked your path
        </h1>
        <p className="mx-auto mt-5 max-w-190 text-[18px] leading-relaxed text-[#676767]">
          Browse mentor profiles and open detailed timelines before scheduling a conversation.
        </p>
      </div>

      {error && (
        <div className="mt-8 rounded-3xl border-[3px] border-black bg-[#fff4f2] p-5 text-[#b42318] shadow-[6px_6px_0_#000]">
          {error}
        </div>
      )}

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {alumni.map((person) => (
          <Link key={person._id} to={`/alumni/${person._id}`} className="no-underline" data-reveal>
            <Card className="h-full transition-transform hover:-translate-y-1">
              <p className="font-['Epilogue'] text-[30px] font-black leading-tight text-black">{person.name}</p>
              <p className="mt-2 text-[17px] text-[#5c5c5c]">{person.currentRole || 'Role not set'}</p>
              <p className="mt-1 text-[16px] text-[#676767]">{person.currentCompany || 'Company not set'}</p>
              <p className="mt-4 inline-flex rounded-full border-2 border-black bg-[#f8d6b3] px-3 py-1 text-sm font-semibold text-black">
                {person.major}
              </p>
              {onlineIds.has(person._id) && (
                <p className="mt-3 inline-flex rounded-full border-2 border-black bg-[#dff5ef] px-3 py-1 text-sm font-semibold text-black">
                  Online
                </p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}