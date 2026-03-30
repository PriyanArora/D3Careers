import { createContext, useContext, useState, useEffect } from 'react'

//fallback value if someone calls usecontext(authcontext) outside authprovider
const AuthContext = createContext(null)

export function AuthProvider({children}){
  const[user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) 

  useEffect(()=>{
    const token = localStorage.getItem('pf_token')
    const stored = localStorage.getItem('pf_user')
    if(token&&stored){
      try{
        setUser(JSON.parse(stored))
      }
      catch(error){
        console.error({ cause: error }, 'invalid stored user data')                                                                                                         
        localStorage.removeItem('pf_user')
        localStorage.removeItem('pf_token')
      }
    }
    
    setLoading(false)
  }, [])

  function login(token, userData){
    localStorage.setItem('pf_token', token)
    localStorage.setItem('pf_user', JSON.stringify(userData))
    setUser(userData)
  }

  function logout(){
    localStorage.removeItem('pf_token')
    localStorage.removeItem('pf_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{user,login,logout, loading}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

//loading=true  → return null (blank screen, around 10ms)                                                                                                                     
//loading=false → re-render in protectedroute → check user → redirect or show dashboard     