import fetchInstance from "../fetchInstance";
import { FETCH_ALL_USERS } from "../apis";

export const fetchAllUsers = async () => {
  return await fetchInstance(FETCH_ALL_USERS, { method: "GET" });
};
