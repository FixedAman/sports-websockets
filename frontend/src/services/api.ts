import axios from "axios";
// request the match lists
export const fetchingMatchData = async () => {
  const { data, status } = await axios.get("https://sports-websockets.onrender.com/");
  console.log("response is coming")
  return { data, status };
};
