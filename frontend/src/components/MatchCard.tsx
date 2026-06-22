import { useState } from "react";
import { MatchCardProps } from "../types/match";



const MatchCard = ({ match ,  setCommentary , isLoading} : MatchCardProps ) => {
const [isClicked , setIsClicked] = useState(false)
const handleClick = (id : number)=>{
const ws = new WebSocket("ws://localhost:8000/ws")
ws.onopen = ()=>{
  ws.send(JSON.stringify({type: "subscribe" , matchId: id}))
  ws.onmessage = (event)=>{
      const data =JSON.parse(event.data)
      if(data.type === "commentary"){
        setCommentary((prev)=>[
          data.data.commentary ,
          ...prev
        ])
      }
    }
  }
setIsClicked((prev)=>!prev)
}


  return (
  
  <div className="w-full rounded-[28px] border-[3px] border-black bg-white p-5 shadow-[6px_6px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000]">
  
  {/* Top */}
  <div className="mb-6 flex items-center justify-between">
    <span className="rounded-full border-2 border-black px-4 py-1 text-xs font-bold tracking-wide">
      {match.sport.toUpperCase()}
    </span>

    <div className="flex items-center gap-2">
      <span className="h-3 w-3 animate-pulse rounded-full bg-red-500"></span>
      <span className="font-semibold">
        {match.status}
      </span>
    </div>
  </div>

  {/* Teams */}
  <div className="space-y-5">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold">
        {match.homeTeam}
      </h3>

      <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black font-bold">
        {match.homeScore}
      </div>
    </div>

    <div className="flex items-center justify-between">
      <h3 className="text-lg font-bold">
        {match.awayTeam}
      </h3>

      <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black font-bold">
        {match.awayScore}
      </div>
    </div>
  </div>

  {/* Footer */}
  <div className="mt-6 border-t-2 border-zinc-200 pt-4 flex items-center justify-between">
    <span className="text-sm text-zinc-500">
      Live Match
    </span>
    <button className="rounded-full border-2 border-black bg-blue-300 px-4 py-2 text-sm font-bold transition hover:scale-105" onClick={(e)=>handleClick(match.id)}>
    { isClicked ? <p>Watching Live</p> : <p>Watch Live</p>  }
    </button>
  </div>

</div>
  );
}
export default MatchCard;