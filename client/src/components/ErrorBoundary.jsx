import { Component } from 'react'
import { useRouteError } from 'react-router-dom'

export function RouterErrorPage() {
  const error = useRouteError()
  return (
    <div className="mx-auto mt-10 max-w-230 rounded-3xl border-[3px] border-black bg-white p-8 shadow-[8px_8px_0_#000]">
      <p className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-[#6a6a6a]">Route error</p>
      <h2 className="mt-3 font-['Epilogue'] text-[42px] font-black uppercase leading-tight text-black">Something went wrong</h2>
      <p className="mt-3 text-[18px] text-[#606060]">{error?.statusText || error?.message || 'An unexpected error occurred.'}</p>
    </div>
  )
}

export default class ErrorBoundary extends Component{
  constructor(props){
    super(props)
    this.state = {hasError: false}
  }

  static getDerivedStateFromError(){
    return {hasError: true}
  }

  render(){
    if(this.state.hasError){
      return (
        <div className="mt-8 rounded-3xl border-[3px] border-black bg-white p-8 text-center shadow-[8px_8px_0_#000]">
          <p className="font-['Epilogue'] text-[32px] font-black uppercase text-black">Diagram unavailable</p>
          <p className="mt-3 text-[18px] text-[#646464]">Could not load this pathway view right now. Please try again shortly.</p>
        </div>
      )
    }
    return this.props.children
  }
}