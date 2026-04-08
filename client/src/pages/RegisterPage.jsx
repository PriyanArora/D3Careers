import { useState } from 'react'                                                                                                                                      
import { useNavigate } from 'react-router-dom'                                                                                                                        
import api from '../api'
import { useAuth } from '../AuthContext'
import Card from '../components/UI/Card'
import Input from '../components/UI/Input'
import Button from '../components/UI/Button'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [role, setRole] = useState('student')
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    try{
      const res = await api.post(`/api/auth/register/${role}`, form) //server succesful registration result is stored in res
      login(res.data.token, res.data.user) //storing res token and user info in localstorage so logged in persisits after refreshes or changing pages too
      navigate('/dashboard')
    } 
    catch(err){
      setError(err.response?.data?.errors?.[0]?.msg || 'Registration failed') //every ? means if any step null or undefineined return undefined, || is fallback if all return undefined or null
    }
  }

  return (
    <section className="mx-auto max-w-175 pt-12">
      <Card className="bg-[#dff5ef]" data-reveal>
        <p className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-[#5e5e5e]">Register</p>
        <h1 className="mt-3 font-['Epilogue'] text-[48px] font-black uppercase leading-[0.95] tracking-[-0.04em] text-black">
          Start with D3Careers
        </h1>
        <p className="mt-3 text-[18px] text-[#666666]">Create your account and begin connecting.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="button" variant={role === 'student' ? 'primary' : 'outline'} onClick={() => setRole('student')}>
            Student
          </Button>
          <Button type="button" variant={role === 'alumni' ? 'primary' : 'outline'} onClick={() => setRole('alumni')}>
            Alumni
          </Button>
          <p className="w-full text-[15px] text-[#5f5f5f]">Registering as: {role}</p>
        </div>

        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          <Input
            id="register-name"
            type="text"
            label="Name"
            placeholder="Your name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            id="register-email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            id="register-password"
            type="password"
            label="Password"
            placeholder="Create password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            error={error}
            required
          />
          <div className="mt-2">
            <Button type="submit" size="lg">Register</Button>
          </div>
        </form>
      </Card>
    </section>
  )
}
