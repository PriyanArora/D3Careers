import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function LoginPromptModal(){
  const {login, user} = useAuth()
  const [form, setForm] = useState({email: '', password:''})
  const [isOpen, setIsOpen] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    if(user){ // as useeffect fires up as soon as component renders, if user not logged in, without conditional it drops modal.
      setIsOpen(false)
    }
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    try{
      const res = await api.post("/api/auth/login", form)
      login(res.data.token, res.data.user)
    }
    catch(error){
      setError("Invalid email or password")
    }
  }

  if(!isOpen){
    return null
  }
  else{
    return(
    <div>
      <h1>Login</h1>
      {error && <p>{error}</p>}
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
}