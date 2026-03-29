import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext= createContext(null)

export function AuthProvider({children}){
  const[user, setUser] = useState(null)

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
    <AuthContext.Provider value={{user,login,logout}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}