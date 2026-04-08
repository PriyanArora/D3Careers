import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../AuthContext'
import Button from './UI/Button'
import Input from './UI/Input'

export default function LoginPromptModal({ open, onClose }) {
  const { login, user } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user && open) {
      onClose?.()
    }
  }, [open, onClose, user])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await api.post('/api/auth/login', form)
      login(res.data.token, res.data.user)
      onClose?.()
    } catch (requestError) {
      setError('Invalid email or password')
      console.error({ cause: requestError }, 'soft login failed')
    }
  }

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-140 rounded-3xl border-[3px] border-black bg-white p-6 shadow-[8px_8px_0_#000] sm:p-8">
        <p className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-[#6a6a6a]">Login required</p>
        <h2 className="mt-3 font-['Epilogue'] text-[42px] font-black uppercase leading-tight text-black">Continue your booking</h2>
        <p className="mt-3 text-[18px] leading-relaxed text-[#666666]">
          Sign in to schedule a chat with this alumni mentor.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <Input
            id="soft-login-email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            id="soft-login-password"
            type="password"
            label="Password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={error}
            required
          />
          <div className="mt-1 flex flex-col gap-3 sm:flex-row">
            <Button type="submit" className="w-full sm:w-auto">
              Login
            </Button>
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>
              Close
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}