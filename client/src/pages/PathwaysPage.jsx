import { useState, useEffect } from 'react'
import api from '../api'
import SankeyDiagram from '../components/SankeyDiagram'
import ErrorBoundary from '../components/ErrorBoundary'
import { useAuth } from '../AuthContext'

export default function PathwaysPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)

  useEffect(()=>{
    api.get('/api/pathways/sankey')
      .then(res=>setData(res.data))
      .catch(err=>console.error({cause: err}, 'sankey fetch failed'))
  }, [])

  return (
    <div>
      <h1>Career Pathways</h1>
      {data ? <ErrorBoundary><SankeyDiagram data={data} /></ErrorBoundary>: <p>Loading...</p>}
      {user ? <button>Bookmark</button> : null}
    </div>
  )
}