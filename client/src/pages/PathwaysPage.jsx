import { useState, useEffect } from 'react'
import api from '../api'
import SankeyDiagram from '../components/SankeyDiagram'
import ErrorBoundary from '../components/ErrorBoundary'
import FilterPanel from '../components/FilterPanel'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

export default function PathwaysPage() {
  const [data, setData] = useState(null)
  const [filters, setFilters] = useState({ major: '', background: '', depth: 'full' })
  const [loading, setLoading] = useState(true)

  const handleFilterChange = (nextFilters) => {
    setLoading(true)
    setFilters(nextFilters)
  }

  useEffect(()=>{
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
    <section className="pt-10">
      <div className="mx-auto max-w-245 text-center" data-reveal>
        <h1 className="mt-6 font-['Epilogue'] text-[38px] font-black uppercase leading-[0.98] tracking-[-0.04em] text-black sm:text-[58px]">
          Explore real career
          <br />
          transitions
        </h1>
        <p className="mx-auto mt-5 max-w-190 text-[18px] leading-relaxed text-[#676767]">
          Filter the Sankey map by major, background, and depth to discover role pathways that match your situation.
        </p>
      </div>

      <div className="mt-10" data-reveal>
      <FilterPanel filters={filters} onChange={handleFilterChange} />
      </div>

      <div className="mt-8" data-reveal>
      {loading ? (
        <LoadingSkeleton />
      ) : data && data.nodes?.length > 0 ? (
        <ErrorBoundary><SankeyDiagram data={data} /></ErrorBoundary>
      ) : (
        <EmptyState />
      )}
      </div>
    </section>
  )
}