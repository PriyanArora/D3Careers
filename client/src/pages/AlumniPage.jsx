import api from "../api"
import { useState, useEffect } from "react"
import {Link} from "react-router-dom"

export default function AlumniPage() {
  const [alumni, setAlumni] = useState([])
  const [error, setError] = useState(null)
  
  useEffect(()=>{
    async function getAlumni(){
      try{
        const res = await api.get("/api/alumni")
        setAlumni(res.data.alumni)
      }
      catch(error){
        setError("Alumni couldn't get fetched")
      }
    }
    getAlumni()
  }, [])

  return(
    <div>
    {alumni.map(person =>(  //person is a variable name, could be anything, and every map item needs key prop, using person._id
      <div key = {person._id}> 
        <Link to = {`/alumni/${person._id}`}>
          <p>{person.name}</p>
        </Link>
      </div>
    ))}
    </div>
  )
}