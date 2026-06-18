import axios from "axios";
// request the match lists
export const fetchingMatchData = async () => {
  const { data, status } = await axios.get("http://localhost:8000/");
  console.log("response is coming")
  return { data, status };
};
