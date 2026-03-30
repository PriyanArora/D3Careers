import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api"
import { useAuth } from "../AuthContext"

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
    catch(error){
      setError("Invalid email or password") //setting error from null to this if unsuccesful login, then with the conditional in return it doesnt render for error not null
    }
  }

  return(
  <div>
    <h1>Login</h1>
    {error && <p>{error}</p>}                 {/* conditional stmt, above written expln. */}
    <form onSubmit={handleSubmit}>
      
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={e => setForm({...form, email: e.target.value})}
      />
      
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
      />
      
      <button type="submit">Login</button>
      
    </form>
  </div>
  )
}