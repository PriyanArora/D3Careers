import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import { useAuth } from "../AuthContext"
import Card from '../components/UI/Card'
import Input from '../components/UI/Input'
import Button from '../components/UI/Button'

export default function LoginPage() {
  const {login} = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({email: '', password: ''})
  const [error, setError] = useState(null)

  //e is browser action, naturally it refreshes page but we do preventDeault then do our things after to override default behaviour
  async function handleSubmit(e){
    e.preventDefault()
    try{
      const res = await api.post('/api/auth/login', form)
      login(res.data.token, res.data.user)
      navigate("/dashboard")
    }
    catch{
      setError("Invalid email or password") //setting error from null to this if unsuccesful login, then with the conditional in return it doesnt render for error not null
    }
  }

  return(
  <section className="mx-auto max-w-160 pt-12">
    <Card className="bg-[#f8d6b3]" data-reveal>
      <p className="font-['Lexend_Mega'] text-[10px] font-black uppercase tracking-[0.12em] text-[#5e5e5e]">Login</p>
      <h1 className="mt-3 font-['Epilogue'] text-[48px] font-black uppercase leading-[0.95] tracking-[-0.04em] text-black">
        Welcome back
      </h1>
      <p className="mt-3 text-[18px] text-[#666666]">Sign in to continue your D3Careers journey.</p>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <Input
          id="login-email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          required
        />

        <Input
          id="login-password"
          type="password"
          label="Password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          error={error}
          required
        />

        <div className="mt-2">
          <Button type="submit" size="lg">Login</Button>
        </div>
      </form>
    </Card>
  </section>
  )
}