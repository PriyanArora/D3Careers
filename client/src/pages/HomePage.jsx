import { useEffect } from 'react'
import api from '../api'
import HeroSection from '../components/landing/HeroSection'

export default function HomePage() {
  useEffect(() => {
    api.get('/api/health')
      .then(res => console.info({ status: res.status }, 'health check'))
      .catch(err => console.error({ cause: err }, 'health check failed'))
  }, [])

  return (
    <>
      <HeroSection />
    </>
  )
}