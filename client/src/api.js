import axios from 'axios'

//for backend communication
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

//jwt header, attaches token to every api request (for jwt authentication later on)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pf_token')
  if(token){
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

async function withRetry(fn, retries = 2, delay = 2000) {
  try {
    return await fn()
  } 
  catch(err){
    if(retries > 0 && err.response?.status === 503){
      await new Promise((res) => setTimeout(res, delay))
      return withRetry(fn, retries - 1, delay)
    }
    throw err
  }
}

export { withRetry }
export default api