import { cloneElement, isValidElement, useState } from 'react'
import { useAuth } from '../AuthContext'
import LoginPromptModal from './LoginPromptModal'

export default function SoftAuthGate({ children }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  if (user) {
    return children
  }

  if (!isValidElement(children)) {
    return null
  }

  const childClick = children.props.onClick
  const gatedChild = cloneElement(children, {
    onClick: (event) => {
      event.preventDefault()
      setOpen(true)
      if (childClick) {
        childClick(event)
      }
    },
  })

  return (
    <>
      {gatedChild}
      <LoginPromptModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}