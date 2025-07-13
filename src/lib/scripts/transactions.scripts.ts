import fetchInstance from "../fetchInstance";
import { FETCH_ALL_TRANSACTIONS } from "../apis";

export const fetchAllTransactions = async () => {
  return await fetchInstance(FETCH_ALL_TRANSACTIONS, { method: "GET" });
};
