import { useState, useEffect } from 'react'
import api from '../api'
import SankeyDiagram from '../components/SankeyDiagram'
import ErrorBoundary from '../components/ErrorBoundary'
import { useAuth } from '../AuthContext'
import FilterPanel from '../components/FilterPanel'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

export default function PathwaysPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [filters, setFilters] = useState({ major: '', background: '', depth: 'full' })
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    setLoading(true)
    //this builds a url query string for me, this would contain the filters such as major background depth
    const params = new URLSearchParams()
    if(filters.major){
      params.append('major', filters.major)
    }
    if(filters.background){
      params.append('background', filters.background)
    }
    if(filters.depth){
      params.append('depth', filters.depth)
    }
    
    api.get(`/api/pathways/sankey?${params}`)
      .then(res=>{
        setData(res.data)
        setLoading(false)
      })
      .catch(err=>{
        console.error({cause: err}, 'sankey fetch failed')
        setLoading(false)
      })

  }, [filters])

  return (
    <div>
      <h1>Career Pathways</h1>
      <FilterPanel filters={filters} onChange={setFilters} />
      {loading ? (
        <LoadingSkeleton />
      ) 
      : data && data.nodes?.length > 0 ? (
        <ErrorBoundary><SankeyDiagram data={data} /></ErrorBoundary>
      ) 
      : (
        <EmptyState />
      )
      }
      {user ? <button>Bookmark</button> : null}
    </div>
  )
}