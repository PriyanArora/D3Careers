import { Component } from 'react'

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