import api, { withRetry } from '../api'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/UI/Card'
import PageIntro from '../components/UI/PageIntro'
import ErrorBanner from '../components/UI/ErrorBanner'
import LoadingSkeleton from '../components/LoadingSkeleton'

export default function AlumniPage() {
  const [alumni, setAlumni] = useState([])
  const [error, setError] = useState(null)
  const [onlineIds, setOnlineIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getAlumni() {
      try {
        const res = await withRetry(() => api.get('/api/alumni'))
        const alumniData = Array.isArray(res.data) ? res.data : (res.data?.alumni || [])
        setAlumni(alumniData)
      } catch (error) {
        setError("Alumni couldn't get fetched: " + error.message)
      } finally {
        setLoading(false)
      }
    }
    getAlumni()
  }, [])

  useEffect(() => {
    async function getOnlineAlumni() {
      try {
        const res = await withRetry(() => api.get('/api/alumni/online'))
        setOnlineIds(new Set(res.data)) 
      } catch (error) {
        setError("Online alumni couldn't get fetched: " + error.message)
      }
    }
    const id = setInterval(() => getOnlineAlumni(), 30000)
    getOnlineAlumni()
    return () => clearInterval(id)
  }, [])

  return (
    <section className="pt-10">
      <PageIntro
        title={
          <>
            Meet mentors who
            <br />
            walked your path
          </>
        }
        description="Browse mentor profiles and open detailed timelines before scheduling a conversation."
      />

      <ErrorBanner message={error} className="mt-8" />

      {loading ? (
        <LoadingSkeleton />
      ) : (
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
      )}
    </section>
  )
}
