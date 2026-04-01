import SoftAuthGate from "../components/SoftAuthGate"

export default function AlumniProfilePage() {
  return (
    <div>
      <h1>Alumni Profile</h1>
      <SoftAuthGate><button>Schedule Chat</button></SoftAuthGate>
    </div>
  )
}