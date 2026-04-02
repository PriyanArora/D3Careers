import { useState, useEffect} from "react"
import SoftAuthGate from "../components/SoftAuthGate"
import { useParams } from "react-router-dom"
import api from "../api"

export default function AlumniProfilePage(e) {
  const {id} = useParams()
  const [error, setError] = useState(null)
  const [alumni, setAlumni] = useState(null)

  useEffect(()=>{
    async function fetchAlumni() {
      try{
        const res = await api.get(`/api/alumni/${id}`)
        setAlumni(res.data)
      }
      catch(error){
        setError("Couldn't fetch Alumni")
      }
    }

    fetchAlumni()
  }, [])

  return (
    <div>
      <h1>Alumni Profile</h1>
      <p>{alumni?.name}</p>
      <p>{alumni?.currentRole}</p>
      <p>{alumni?.currentCompany}</p>
      <p>{alumni?.major}</p>
      <p>{alumni?.bio}</p>
      <p>{alumni?.backgroundTags}</p>
      <div>
        {alumni?.careerTimeline?.map(person=>(
          <div key={person._id}>
            <p>{person.title}</p>
            <p>{person.company}</p>
            <p>{person.industry}</p>
            <p>{person.startYear}</p>
            <p>{person.skillsGained}</p>
            <p>{person.adviceForSelf}</p>
          </div>
        ))}
      </div>

      <SoftAuthGate><button>Schedule Chat</button></SoftAuthGate>
    </div>
  )
}