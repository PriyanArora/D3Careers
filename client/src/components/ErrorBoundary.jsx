import { Component } from 'react'
import { useRouteError } from 'react-router-dom'

export function RouterErrorPage() {
  const error = useRouteError()
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Something went wrong</h2>
      <p>{error?.statusText || error?.message || 'An unexpected error occurred.'}</p>
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
      return <p>Couldn't load diagram. Please try again later</p>
    }
    return this.props.children
  }
}