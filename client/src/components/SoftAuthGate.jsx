import { useAuth } from "../AuthContext";
import LoginPromptModal from "./LoginPromptModal";

export default function SoftAuthGate({children}){
  const {user} = useAuth()
  if(user){
    return children
  }
  else{
    return (<LoginPromptModal></LoginPromptModal>)
  }
}