import { useEffect } from 'react'
import api from '../api'

export default function HomePage() {
  useEffect(() => {
    api.get('/api/health')
      .then(res => console.info({ status: res.status }, 'health check'))
      .catch(err => console.error({ cause: err }, 'health check failed'))
  }, [])

  return <h1>Home</h1>
}