import { useState } from 'react'                                                                                                                                      
import { useNavigate } from 'react-router-dom'                                                                                                                        
import api from '../api'
import { useAuth } from '../AuthContext'

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
    <div>
      <h1>Register</h1>
      {error && <p>{error}</p>}
      <div>
        <button onClick={() => setRole('student')}>Student</button>
        <button onClick={() => setRole('alumni')}>Alumni</button>
        <p>Registering as: {role}</p>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Register</button>
      </form>
    </div>
  )
}
