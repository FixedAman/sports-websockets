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
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8 ">
        {/* Left Side */}
        <div className="flex-1">
          <MatchList setCommentary={setCommentary} />
        </div>

        {/* Right Sidebar */}
        <CommentaryFeed commentary={commentary} />
      </div>
    </>
  );
};
export default Home;
