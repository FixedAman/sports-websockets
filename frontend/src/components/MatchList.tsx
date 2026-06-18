import { useEffect, useState } from "react"
import { fetchingMatchData } from "../services/api"
import { Match } from "../types/match"
import MatchCard from "./MatchCard"

const MatchList = ()=>{
  const [matches , setMatches] = useState<Match[]>([])
useEffect(()=>{
  
const data = async()=>{
 try {
  const res = await fetchingMatchData()
  setMatches(res.data.data)
 }catch(err){
  console.log(err)
 }
}
data()
}, [])

// creating websocket for fetching data 
useEffect(()=>{
const ws = new WebSocket("ws://localhost:8000/ws")
ws.onmessage = (event)=>{
  const updatedMatch = JSON.parse(event.data)
  setMatches((prev)=>prev.map((m)=>m.id === updatedMatch.id ? updatedMatch : m))
}
return ()=> ws.close()
},[])

  return <>
<div className="max-w-7xl mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold mb-6">
    Current Matches
  </h1>

  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
    {matches.map((m) => (
      <MatchCard
        key={m.id}
        match={m}
      />
    ))}
  </div>
</div>
 
  </>
}

export default MatchList