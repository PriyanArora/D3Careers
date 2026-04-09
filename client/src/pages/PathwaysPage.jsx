import { useState, useEffect } from 'react'
import api, { withRetry } from '../api'
import SankeyDiagram from '../components/SankeyDiagram'
import ErrorBoundary from '../components/ErrorBoundary'
import FilterPanel from '../components/FilterPanel'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import PageIntro from '../components/UI/PageIntro'

export default function PathwaysPage() {
  const [data, setData] = useState(null)
  const [filters, setFilters] = useState({ major: '', background: '', depth: 'full' })
  const [loading, setLoading] = useState(true)

  const handleFilterChange = (nextFilters) => {
    setLoading(true)
    setFilters(nextFilters)
  }

  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.major) {
      params.append('major', filters.major)
    }
    if (filters.background) {
      params.append('background', filters.background)
    }
    if (filters.depth) {
      params.append('depth', filters.depth)
    }

    withRetry(() => api.get(`/api/pathways/sankey?${params}`))
      .then((res) => {
        setData(res.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error({ cause: err }, 'sankey fetch failed')
        setLoading(false)
      })
  }, [filters])

  return (
    <section className="pt-10">
      <PageIntro
        title={
          <>
            Explore real career
            <br />
            transitions
          </>
        }
        description="Filter the Sankey map by major, background, and depth to discover role pathways that match your situation."
      />

      <div className="mt-10" data-reveal>
        <FilterPanel filters={filters} onChange={handleFilterChange} />
      </div>

      <div className="mt-8" data-reveal>
        {loading ? (
          <LoadingSkeleton />
        ) : data && data.nodes?.length > 0 ? (
          <ErrorBoundary>
            <SankeyDiagram data={data} />
          </ErrorBoundary>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  )
}