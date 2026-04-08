import api from "../api"
import { useState, useEffect } from "react"
import {Link} from "react-router-dom"

export default function AlumniPage() {
  const [alumni, setAlumni] = useState([])
  const [error, setError] = useState(null)
  const [onlineIds, setOnlineIds] = useState(new Set())

  useEffect(()=>{
    async function getAlumni(){
      try{
        const res = await api.get("/api/alumni")
        setAlumni(res.data.alumni)
      }
      catch(error){
        setError("Alumni couldn't get fetched: " + error.message)
      }
    }
    getAlumni()
  }, [])

  useEffect(() => {
    async function getOnlineAlumni() {
      try{
        const res = await api.get("/api/alumni/online")
        setOnlineIds(new Set(res.data)) 
      }
      catch(error){
        setError("Online alumni couldn't get fetched: " + error.message)
      }
    }
    const id = setInterval(() => getOnlineAlumni(), 30000) //fetch online status every 30 seconds
    getOnlineAlumni()
    return () => clearInterval(id) //cleanup function to clear the interval when component unmounts
  }, [])

  return(
    <div>
    {error && <p>{error}</p>} {/*if there's an error (if true), show the error message */}
    {alumni.map(person =>(  //person is a variable name, could be anything, and every map item needs key prop, using person._id
      <div key = {person._id}> 
        <Link to = {`/alumni/${person._id}`}>
          <p>{person.name}</p>
          {onlineIds.has(person._id) && <p>Online</p>} {/*if the person's id is in the onlineIds set (if true), show "Online" next to their name*/}
        </Link>
      </div>
    ))}
    </div>
  )
}