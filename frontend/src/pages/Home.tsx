import { useState } from "react";
import Header from "../components/Header";
import MatchCard from "../components/MatchCard";
import MatchList from "../components/MatchList";
import { Commentary } from "../types/match";
import CommentaryFeed from "../components/CommentaryFeed";
  
const Home = () => {
  const [commentary , setCommentary] = useState<Commentary[]>([])
  return (
    <>
      <Header />
       <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6 lg:py-8">
    {/* Match List */}
    <div className="flex-1">
      <MatchList setCommentary={setCommentary} />
    </div>

    {/* Commentary */}
    <div className="w-full lg:w-[380px] lg:shrink-0">
      <CommentaryFeed commentary={commentary} />
    </div>
  </div>
    </>
  );
};
export default Home;
