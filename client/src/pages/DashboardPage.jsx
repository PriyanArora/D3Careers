import { useEffect, useRef, useState } from 'react'
import api from '../api'
import { useAuth } from '../AuthContext'
import Button from '../components/UI/Button'
import Card from '../components/UI/Card'
import ErrorBanner from '../components/UI/ErrorBanner'
import Input from '../components/UI/Input'
import LoadingSkeleton from '../components/LoadingSkeleton'

const backgroundOptions = [
  { label: 'First-gen', value: 'firstGen' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'International', value: 'international' },
]

const createEmptyJob = () => ({
  title: '',
  company: '',
  industry: '',
  startYear: '',
  endYear: '',
  skillsInput: '',
  adviceForSelf: '',
})

const toFormJobs = (timeline) => {
  if (!Array.isArray(timeline) || timeline.length === 0) {
    return [createEmptyJob()]
  }

  return timeline.map((job) => ({
    title: job?.title || '',
    company: job?.company || '',
    industry: job?.industry || '',
    startYear: job?.startYear ? String(job.startYear) : '',
    endYear: job?.endYear ? String(job.endYear) : '',
    skillsInput: Array.isArray(job?.skillsGained) ? job.skillsGained.join(', ') : '',
    adviceForSelf: job?.adviceForSelf || '',
  }))
}

export default function DashboardPage() {
  const { user } = useAuth()
  const completeProfileRef = useRef(null)
  const [alumniProfile, setAlumniProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [profileSuccess, setProfileSuccess] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mentorSessions, setMentorSessions] = useState([])
  const [meetingsLoading, setMeetingsLoading] = useState(false)

  const [form, setForm] = useState({
    major: '',
    currentRole: '',
    currentCompany: '',
    bio: '',
    backgroundTags: [],
    isAvailableForMentorship: true,
    jobs: [createEmptyJob()],
  })

  const isAlumni = user?.role === 'alumni'

  useEffect(() => {
    async function fetchAlumniProfile() {
      if (!isAlumni || !user?.id) {
        return
      }

      setProfileLoading(true)
      setProfileError(null)

      try {
        const res = await api.get(`/api/alumni/${user.id}`)
        const profile = res.data
        setAlumniProfile(profile)
        setForm({
          major: profile.major || '',
          currentRole: profile.currentRole || '',
          currentCompany: profile.currentCompany || '',
          bio: profile.bio || '',
          backgroundTags: Array.isArray(profile.backgroundTags) ? profile.backgroundTags : [],
          isAvailableForMentorship: profile.isAvailableForMentorship ?? true,
          jobs: toFormJobs(profile.careerTimeline),
        })
      } catch (error) {
        setProfileError(error.response?.data?.error || 'Could not load alumni profile')
      } finally {
        setProfileLoading(false)
      }
    }

    fetchAlumniProfile()
  }, [isAlumni, user?.id])

  useEffect(() => {
    async function fetchMeetings() {
      if (!user?.id || !user?.role) {
        return
      }

      setMeetingsLoading(true)

      try {
        const endpoint = user.role === 'alumni' ? `/api/alumni/${user.id}/sessions` : `/api/bookings/${user.id}`
        const res = await api.get(endpoint)
        const data = res.data
        const sessionList = Array.isArray(data) ? data : (Array.isArray(data?.sessions) ? data.sessions : [])
        const activeSessions = sessionList.filter((session) => (session?.status || 'confirmed') === 'confirmed')
        setMentorSessions(activeSessions)
      } catch {
        setMentorSessions([])
      } finally {
        setMeetingsLoading(false)
      }
    }

    fetchMeetings()
  }, [user?.id, user?.role])

  const isProfileIncomplete = isAlumni && !profileLoading && alumniProfile && !alumniProfile.isProfileComplete
  const shouldShowProfileForm = isAlumni && !profileLoading && alumniProfile

  function scrollToProfileForm() {
    completeProfileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function toggleBackgroundTag(tag) {
    setForm((current) => {
      const alreadySelected = current.backgroundTags.includes(tag)
      const nextTags = alreadySelected
        ? current.backgroundTags.filter((item) => item !== tag)
        : [...current.backgroundTags, tag]

      return { ...current, backgroundTags: nextTags }
    })
  }

  function addJobField() {
    setForm((current) => ({
      ...current,
      jobs: [...current.jobs, createEmptyJob()],
    }))
  }

  function updateJobField(index, field, value) {
    setForm((current) => ({
      ...current,
      jobs: current.jobs.map((job, jobIndex) => {
        if (jobIndex !== index) {
          return job
        }

        return {
          ...job,
          [field]: value,
        }
      }),
    }))
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setProfileError(null)
    setProfileSuccess(null)

    if (!form.major || !form.currentRole || !form.currentCompany || !form.bio) {
      setProfileError('Major, current role, company, and bio are required to complete your profile.')
      return
    }

    if (!form.jobs[0]?.title?.trim()) {
      setProfileError('First job title is required.')
      return
    }

    setIsSubmitting(true)

    try {
      const timelinePayload = form.jobs
        .map((job) => {
          const title = job.title.trim()
          const company = job.company.trim()
          const industry = job.industry.trim()
          const adviceForSelf = job.adviceForSelf.trim()
          const startYear = job.startYear ? Number(job.startYear) : undefined
          const endYear = job.endYear ? Number(job.endYear) : undefined
          const skillsGained = job.skillsInput
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)

          const hasContent = Boolean(title || company || industry || adviceForSelf || startYear || endYear || skillsGained.length)
          if (!hasContent) {
            return null
          }

          return {
            title,
            company,
            industry,
            startYear,
            endYear,
            skillsGained,
            adviceForSelf,
          }
        })
        .filter(Boolean)

      const payload = {
        major: form.major,
        currentRole: form.currentRole,
        currentCompany: form.currentCompany,
        bio: form.bio,
        backgroundTags: form.backgroundTags,
        isAvailableForMentorship: form.isAvailableForMentorship,
        careerTimeline: timelinePayload,
      }

      const res = await api.post('/api/alumni', payload)
      setAlumniProfile(res.data.alumni)
      setForm((current) => ({
        ...current,
        jobs: toFormJobs(res.data.alumni?.careerTimeline),
      }))
      setProfileSuccess(
        alumniProfile?.isProfileComplete
          ? 'Profile updated successfully.'
          : 'Profile completed. You are now visible on the alumni page.',
      )
    } catch (error) {
      setProfileError(error.response?.data?.error || 'Could not save profile details')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="pt-10">
      <div className="rounded-[28px] border-[3px] border-black bg-[#dff5ef] p-6 shadow-[9px_9px_0_#000] sm:p-8" data-reveal>
        <p className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-[#5f5f5f]">Dashboard</p>
        <h1 className="mt-4 font-['Epilogue'] text-[48px] font-black leading-[0.95] tracking-[-0.04em] text-black">
          {user?.name || 'Dashboard'}
        </h1>
        <p className="mt-4 max-w-190 text-[18px] leading-relaxed text-[#656565]">
          Track your booking history and complete your profile in one place.
        </p>
      </div>

      <ErrorBanner message={profileError} className="mt-8" />

      {profileSuccess && (
        <div className="mt-8 rounded-3xl border-[3px] border-black bg-[#eafcf4] p-5 text-[#146c43] shadow-[6px_6px_0_#000]">
          {profileSuccess}
        </div>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="rounded-3xl border-[3px] border-black bg-white p-6 shadow-[7px_7px_0_#000]" data-reveal>
          <p className="font-['Epilogue'] text-[32px] font-black leading-tight text-black">Upcoming Meetings</p>

          {meetingsLoading ? (
            <div className="mt-4 rounded-2xl border-2 border-black bg-[#f7f3f4] p-4">
              <p className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-[#6a6a6a]">
                Loading meetings
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 rounded-full border-[3px] border-black bg-white">
                  <div className="absolute inset-[4px] animate-spin rounded-full border-[4px] border-[#dff5ef] border-t-[#111111]" />
                </div>
                <p className="text-[15px] font-semibold text-[#5d5d5d]">
                  Checking your latest booking data.
                </p>
              </div>
            </div>
          ) : mentorSessions.length === 0 ? (
            <p className="mt-3 text-[17px] text-[#666666]">No meetings booked.</p>
          ) : (
            <ul className="mt-4 grid gap-2">
              {mentorSessions.map((session) => (
                <li key={session._id || session.calEventUid} className="rounded-2xl border-2 border-black bg-[#f7f3f4] px-4 py-3 text-[15px]">
                  {session.scheduledAt ? new Date(session.scheduledAt).toLocaleString() : 'Meeting scheduled'}
                </li>
              ))}
            </ul>
          )}

          {isProfileIncomplete && (
            <button
              type="button"
              className="mt-3 text-[14px] font-semibold text-[#3f67b1] hover:underline"
              onClick={scrollToProfileForm}
            >
              complete your profile
            </button>
          )}
        </article>

        {isAlumni && alumniProfile?.isProfileComplete && (
          <Card className="bg-[#fffdf5]" data-reveal>
            <p className="font-['Epilogue'] text-[32px] font-black leading-tight text-black">Profile</p>
            <p className="mt-3 text-[17px] text-[#666666]">
              Your alumni profile is complete and visible in the alumni directory.
            </p>
          </Card>
        )}
      </div>

      {profileLoading && isAlumni && (
        <div className="mt-6" data-reveal>
          <LoadingSkeleton />
        </div>
      )}

      {shouldShowProfileForm && (
        <div ref={completeProfileRef}>
          <Card className="mt-6" data-reveal>
            <p className="font-['Epilogue'] text-[32px] font-black leading-tight text-black">
              {isProfileIncomplete ? 'Complete your alumni profile' : 'Update your profile'}
            </p>
            <p className="mt-3 text-[17px] text-[#666666]">
              Finish this setup to appear on the alumni page for students.
            </p>

            <form className="mt-6 grid gap-4" onSubmit={handleProfileSubmit}>
              <Input
                id="dashboard-major"
                type="text"
                label="Major"
                placeholder="Computer Science"
                value={form.major}
                onChange={(e) => setForm((current) => ({ ...current, major: e.target.value }))}
                required
              />
              <Input
                id="dashboard-current-role"
                type="text"
                label="Current Role"
                placeholder="Software Engineer"
                value={form.currentRole}
                onChange={(e) => setForm((current) => ({ ...current, currentRole: e.target.value }))}
                required
              />
              <Input
                id="dashboard-current-company"
                type="text"
                label="Current Company"
                placeholder="Company"
                value={form.currentCompany}
                onChange={(e) => setForm((current) => ({ ...current, currentCompany: e.target.value }))}
                required
              />

              <div className="flex w-full flex-col gap-2">
                <label htmlFor="dashboard-bio" className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-black">
                  Bio
                </label>
                <textarea
                  id="dashboard-bio"
                  className="min-h-30 w-full rounded-3xl border-[3px] border-black bg-white px-5 py-4 text-[17px] outline-none"
                  placeholder="Share your journey and what students can learn from it."
                  value={form.bio}
                  onChange={(e) => setForm((current) => ({ ...current, bio: e.target.value }))}
                  required
                />
              </div>

              <div className="flex w-full flex-col gap-2">
                <p className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-black">Background Tags</p>
                <div className="flex flex-wrap gap-2">
                  {backgroundOptions.map((option) => {
                    const selected = form.backgroundTags.includes(option.value)
                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`rounded-full border-[3px] px-4 py-2 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
                          selected ? 'border-black bg-[#f7de5a] text-black' : 'border-black bg-white text-black'
                        }`}
                        onClick={() => toggleBackgroundTag(option.value)}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <label className="mt-1 inline-flex items-center gap-3 text-[16px] text-black">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-black"
                  checked={form.isAvailableForMentorship}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      isAvailableForMentorship: e.target.checked,
                    }))
                  }
                />
                Available for mentorship
              </label>

              <div className="mt-2 flex w-full items-center justify-between gap-4">
                <p className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-black">Career Timeline</p>
                <button
                  type="button"
                  className="inline-flex border-[3px] border-black bg-[#e6e6e6] px-3 py-2 text-sm font-semibold text-black shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5"
                  onClick={addJobField}
                >
                  + Add job
                </button>
              </div>

              <div className="mt-1 grid gap-4">
                {form.jobs.map((job, index) => (
                  <div key={`job-${index}`} className="rounded-3xl border-[3px] border-black bg-[#f9f9f9] p-4">
                    <p className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-[#5f5f5f]">
                      Job {index + 1} {index === 0 ? '(required)' : '(optional)'}
                    </p>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <Input
                        id={`job-title-${index}`}
                        type="text"
                        label="Title"
                        placeholder="Software Engineer"
                        value={job.title}
                        onChange={(e) => updateJobField(index, 'title', e.target.value)}
                        required={index === 0}
                      />
                      <Input
                        id={`job-company-${index}`}
                        type="text"
                        label="Company"
                        placeholder="Company"
                        value={job.company}
                        onChange={(e) => updateJobField(index, 'company', e.target.value)}
                      />
                      <Input
                        id={`job-industry-${index}`}
                        type="text"
                        label="Industry"
                        placeholder="Technology"
                        value={job.industry}
                        onChange={(e) => updateJobField(index, 'industry', e.target.value)}
                      />
                      <Input
                        id={`job-skills-${index}`}
                        type="text"
                        label="Skills Gained"
                        placeholder="React, SQL, Teamwork"
                        value={job.skillsInput}
                        onChange={(e) => updateJobField(index, 'skillsInput', e.target.value)}
                        helperText="Use comma-separated values"
                      />
                      <Input
                        id={`job-start-year-${index}`}
                        type="number"
                        label="Start Year"
                        placeholder="2022"
                        min="1950"
                        max="2100"
                        value={job.startYear}
                        onChange={(e) => updateJobField(index, 'startYear', e.target.value)}
                      />
                      <Input
                        id={`job-end-year-${index}`}
                        type="number"
                        label="End Year"
                        placeholder="2024"
                        min="1950"
                        max="2100"
                        value={job.endYear}
                        onChange={(e) => updateJobField(index, 'endYear', e.target.value)}
                      />
                    </div>

                    <div className="mt-3 flex w-full flex-col gap-2">
                      <label htmlFor={`job-advice-${index}`} className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-black">
                        Advice For Self
                      </label>
                      <textarea
                        id={`job-advice-${index}`}
                        className="min-h-24 w-full rounded-3xl border-[3px] border-black bg-white px-5 py-4 text-[17px] outline-none"
                        placeholder="What would you tell your past self at this stage?"
                        value={job.adviceForSelf}
                        onChange={(e) => updateJobField(index, 'adviceForSelf', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Update profile'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </section>
  )
}
