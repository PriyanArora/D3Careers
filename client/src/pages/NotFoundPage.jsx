import { Link as RouterLink, useLocation } from 'react-router-dom'
import Button from '../components/UI/Button'

export default function NotFoundPage() {
  const location = useLocation()
  const title = location.state?.title || 'Page not found'
  const description = location.state?.description || 'The link may be outdated, or the resource no longer exists.'

  return (
    <section className="mx-auto mt-10 max-w-215 rounded-3xl border-[3px] border-black bg-white p-8 shadow-[8px_8px_0_#000]" data-reveal>
      <p className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-[#666666]">404 error</p>
      <h1 className="mt-3 font-['Epilogue'] text-[48px] font-black uppercase leading-tight text-black">{title}</h1>
      <p className="mt-3 text-[18px] text-[#5f5f5f]">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <RouterLink to="/">
          <Button>Go Home</Button>
        </RouterLink>
        <RouterLink to="/pathways">
          <Button variant="outline">Open Pathways</Button>
        </RouterLink>
        <RouterLink to="/alumni">
          <Button variant="outline">Browse Alumni</Button>
        </RouterLink>
      </div>
    </section>
  )
}
