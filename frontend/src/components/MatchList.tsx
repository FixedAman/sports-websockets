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
wsRef.current = new WebSocket("wss://sports-websockets.onrender.com/ws")
wsRef.current.onopen = ()=>console.log("websocket connected")
wsRef.current.onmessage = (event)=>{
  const updatedMatch = JSON.parse(event.data)
  switch(updatedMatch.type){
    case "score_update" : {
      setMatches((prev)=>prev.map((m)=>m.id === updatedMatch.data.id ? updatedMatch.data : m))
    }
    break;
    case "commentary": {
      setCommentary((prev)=>[updatedMatch.data.commentary ,
        ...prev
      ])

    }
    break
  }
 
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
<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
  <h1 className="mb-6 text-2xl font-bold sm:text-3xl">
    Current Matches
  </h1>

  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
    {isLoading ? (
      <div className="col-span-full flex h-40 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-blue-600" />
      </div>
    ) : (
      matches.map((m) => (
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
    )}
  </div>
</div>
 
  </>
}

export default MatchList