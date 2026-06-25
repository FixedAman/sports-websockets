import { useEffect, useRef, useState } from "react"
import { fetchingMatchData } from "../services/api"
import { Match, MatchListCommentary } from "../types/match"
import MatchCard from "./MatchCard"


const MatchList = ({setCommentary} :MatchListCommentary  )=>{
const [matches , setMatches] = useState<Match[]>([])
const [isLoading , setLoading] = useState(true)
const wsRef = useRef<WebSocket | null >(null)
const [watchingMatchId , setWatchingMatchId] = useState<number | null >(null)
useEffect(()=>{
const data = async()=>{
 try {
  const res = await fetchingMatchData()
  setMatches(res.data.data)
  setLoading(false)
 }catch(err){
  console.log(err)
 }finally{
  setLoading(false)
 }
}
data()
}, [])

// creating websocket for fetching data 
useEffect(()=>{
wsRef.current = new WebSocket("ws://localhost:8000/ws")
wsRef.current.onmessage = (event)=>{
  const updatedMatch = JSON.parse(event.data)
  const curr = updatedMatch?.data
  setMatches((prev)=>prev.map((m)=>m.id === curr?.id ? curr : m))
}
return ()=> wsRef.current?.close()
},[])
// unsubscribing if someone clicked another one 
const handleWatchMatch = (newMatchId : number )=>{
 if(watchingMatchId !== null && watchingMatchId !== newMatchId){
   if(wsRef.current?.readyState === WebSocket.OPEN){
    wsRef.current?.send (
   JSON.stringify({type : "unsubscribe" , matchId : watchingMatchId})
   )
  
   }else {
    console.error("something went wrong please check onthe handleWatchMatch")
   }
    setCommentary([])
  setWatchingMatchId(newMatchId)
 }
}
  return <>
<div className="max-w-7xl mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold mb-6">
    Current Matches
  </h1>

  <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
    {
      isLoading ? (
    <div className="flex justify-center items-center h-40 col-span-full">
      <div className="w-10 h-10 border-4 border-zinc-700 border-t-blue-700 rounded-full animate-spin" />
    </div>
  ) : matches.map((m) => (
      <MatchCard
        key={m.id}
        match={m} 
        setCommentary={setCommentary}
        watchingMatchId={watchingMatchId}
        setWatchingMatchId={setWatchingMatchId}
       handleWatchMatch={handleWatchMatch}
       wsRef={wsRef}
      />
    ))
    }
   
  </div>
</div>
 
  </>
}

export default MatchList